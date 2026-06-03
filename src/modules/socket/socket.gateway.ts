import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: '*', methods: ['GET', 'POST'] },
  namespace: '/events',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly expectedApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.expectedApiKey = this.configService.get<string>('API_KEY') || '';
  }

  handleConnection(client: Socket): void {
    const clientApiKey =
      client.handshake.auth?.['x-api-key'] ||
      client.handshake.headers?.['x-api-key'] ||
      '';

    if (!this.expectedApiKey || clientApiKey !== this.expectedApiKey) {
      console.log(`[Socket] Conexión rechazada — API key inválida desde ${client.id}`);
      client.emit('error', { message: 'API key inválida' });
      client.disconnect(true);
      return;
    }

    console.log(`[Socket] Cliente autenticado conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`[Socket] Cliente desconectado: ${client.id}`);
  }

  emitInvoiceCreated(payload: Record<string, unknown>): void {
    this.server.emit('invoice.created', payload);
  }

  emitInspectionStatusUpdated(payload: Record<string, unknown>): void {
    this.server.emit('inspection.status.updated', payload);
  }
}
