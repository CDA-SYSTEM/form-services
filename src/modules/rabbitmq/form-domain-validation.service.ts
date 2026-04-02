import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { RMQ_PATTERNS } from '../../shared/constants/rmq-patterns';

type ExistsPayload = { id: string };
type ExistsResponse = { exists: boolean };

function resolveRabbitUrl(config: ConfigService): string {
  const uri = config.get<string>('RABBITMQ_URI')?.trim();
  if (uri) {
    return uri;
  }
  const user = config.get<string>('RABBITMQ_QUEUE_USER')?.trim();
  const pass = config.get<string>('RABBITMQ_PASSWORD') ?? '';
  if (user) {
    const host = config.get<string>('RABBITMQ_HOST', 'localhost');
    const port = Number(config.get<string>('RABBITMQ_PORT', '5672'));
    return `amqp://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
  }
  return '';
}

/** Oculta credenciales en logs (amqp://user:pass@host -> amqp://user:***@host) */
function maskAmqpUrl(url: string): string {
  return url.replace(/^(amqps?:\/\/)([^:@/]+):([^@/]+)@/i, '$1$2:***@');
}

@Injectable()
export class FormDomainValidationService implements OnModuleDestroy {
  private readonly logger = new Logger(FormDomainValidationService.name);
  private clientProxy?: ClientProxy;
  private vehicleProxy?: ClientProxy;

  constructor(private readonly config: ConfigService) {}

  private get rabbitUrl(): string {
    return resolveRabbitUrl(this.config);
  }

  private get rpcTimeoutMs(): number {
    return Number(this.config.get<string>('RABBITMQ_RPC_TIMEOUT_MS', '8000'));
  }

  private ensureClients(): void {
    const url = this.rabbitUrl;
    if (!url) {
      return;
    }
    if (this.clientProxy && this.vehicleProxy) {
      return;
    }

    const clientQueue = this.config.get<string>(
      'RABBITMQ_CLIENT_QUEUE',
      'client-service-queue',
    );
    const vehicleQueue = this.config.get<string>(
      'RABBITMQ_VEHICLE_QUEUE',
      'vehicle-service-queue',
    );

    this.clientProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue: clientQueue,
        queueOptions: { durable: true },
        persistent: true,
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
      },
    });

    this.vehicleProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue: vehicleQueue,
        queueOptions: { durable: true },
        persistent: true,
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
      },
    });

    this.logger.log(
      `[RMQ] Clientes RMQ listos url=${maskAmqpUrl(url)} colaCliente=${clientQueue} colaVehiculo=${vehicleQueue} timeoutMs=${this.rpcTimeoutMs}`,
    );
  }

  isRabbitConfigured(): boolean {
    return this.rabbitUrl.length > 0;
  }

  /**
   * Si RabbitMQ está configurado, consulta en paralelo a client-service y vehicle-service.
   * Si no hay URI/credenciales, no hace nada (desarrollo local sin otros microservicios).
   */
  async assertClientAndVehicleExist(
    clientId: string,
    vehicleId: string,
  ): Promise<void> {
    if (!this.rabbitUrl) {
      this.logger.debug(
        '[RMQ] Validacion dominio omitida: no hay RABBITMQ_URI ni usuario/contrasena',
      );
      return;
    }

    this.ensureClients();
    if (!this.clientProxy || !this.vehicleProxy) {
      return;
    }

    const t = this.rpcTimeoutMs;
    const clientPayload: ExistsPayload = { id: clientId.trim() };
    const vehiclePayload: ExistsPayload = { id: vehicleId.trim() };

    const clientQueue = this.config.get<string>(
      'RABBITMQ_CLIENT_QUEUE',
      'client-service-queue',
    );
    const vehicleQueue = this.config.get<string>(
      'RABBITMQ_VEHICLE_QUEUE',
      'vehicle-service-queue',
    );

    this.logger.log(
      `[RMQ] Enviando validacion createForm client_id=${clientPayload.id} vehicle_id=${vehiclePayload.id}`,
    );

    type RpcOutcome =
      | { service: 'cliente'; queue: string; pattern: string; ok: true; response: ExistsResponse }
      | { service: 'cliente'; queue: string; pattern: string; ok: false; error: string }
      | { service: 'vehiculo'; queue: string; pattern: string; ok: true; response: ExistsResponse }
      | { service: 'vehiculo'; queue: string; pattern: string; ok: false; error: string };

    const runRpc = async (
      proxy: ClientProxy,
      pattern: string,
      payload: ExistsPayload,
      service: 'cliente' | 'vehiculo',
      queue: string,
    ): Promise<RpcOutcome> => {
      this.logger.log(
        `[RMQ] -> ${service} cola=${queue} pattern=${JSON.stringify(pattern)} data=${JSON.stringify({ id: payload.id })}`,
      );
      try {
        const response = await firstValueFrom(
          proxy.send<ExistsResponse>(pattern, payload).pipe(timeout(t)),
        );
        this.logger.log(
          `[RMQ] <- ${service} cola=${queue} pattern=${pattern} respuesta=${JSON.stringify(response)}`,
        );
        return {
          service,
          queue,
          pattern,
          ok: true,
          response,
        };
      } catch (err) {
        const msg = String((err as Error)?.message ?? err);
        this.logger.error(
          `[RMQ] <- ${service} FALLO cola=${queue} pattern=${pattern} error=${msg}`,
        );
        return {
          service,
          queue,
          pattern,
          ok: false,
          error: msg,
        };
      }
    };

    const [clientOutcome, vehicleOutcome] = await Promise.all([
      runRpc(
        this.clientProxy,
        RMQ_PATTERNS.CLIENT_EXISTS,
        clientPayload,
        'cliente',
        clientQueue,
      ),
      runRpc(
        this.vehicleProxy,
        RMQ_PATTERNS.VEHICLE_EXISTS,
        vehiclePayload,
        'vehiculo',
        vehicleQueue,
      ),
    ]);

    const rpcFailures = [clientOutcome, vehicleOutcome].filter((o) => !o.ok);
    if (rpcFailures.length > 0) {
      const detalle = rpcFailures
        .map((o) => (o.ok === false ? `${o.service}(${o.queue}): ${o.error}` : ''))
        .filter(Boolean)
        .join(' | ');
      this.logger.error(
        `[RMQ] Validacion abortada por error RPC: ${detalle}`,
      );
      throw new ServiceUnavailableException(
        `No se pudo validar con microservicios (RabbitMQ). Fallo: ${detalle}`,
      );
    }

    const clientRes = (clientOutcome as Extract<RpcOutcome, { ok: true }>)
      .response;
    const vehicleRes = (vehicleOutcome as Extract<RpcOutcome, { ok: true }>)
      .response;

    if (clientRes?.exists !== true) {
      this.logger.warn(
        `[RMQ] Cliente no existe o respuesta invalida client_id=${clientPayload.id} respuesta=${JSON.stringify(clientRes)}`,
      );
      throw new BadRequestException(
        `Cliente no encontrado o invalido: "${clientId}"`,
      );
    }
    if (vehicleRes?.exists !== true) {
      this.logger.warn(
        `[RMQ] Vehiculo no existe o respuesta invalida vehicle_id=${vehiclePayload.id} respuesta=${JSON.stringify(vehicleRes)}`,
      );
      throw new BadRequestException(
        `Vehiculo no encontrado o invalido: "${vehicleId}"`,
      );
    }

    this.logger.log(
      `[RMQ] Validacion dominio OK client_id=${clientPayload.id} vehicle_id=${vehiclePayload.id}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.clientProxy?.close();
    await this.vehicleProxy?.close();
  }
}
