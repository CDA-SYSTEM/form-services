import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { InspectionResponseDto } from './dto/inspection-response.dto';
import { ListInspectionsQueryDto } from './dto/list-inspections-query.dto';
import { PaginatedInspectionResponseDto } from './dto/paginated-inspection-response.dto';
import { UpdateChecklistIdDto } from './dto/update-checklist-id.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { UpdateInspectionStatusDto } from './dto/update-inspection-status.dto';
import { InspectionMapper } from './mappers/inspection.mapper';
import { InspectionRepository } from './repositories/inspection.repository';
import { StatusRepository } from '../status/repositories/status.repository';
import { SocketGateway } from '../socket/socket.gateway';
import { VehicleType } from '../../shared/types/vehicle-type.enum';
import { FormDomainValidationService } from '../rabbitmq/form-domain-validation.service';
import { nanoid } from 'nanoid';

@Injectable()
export class InspectionService {
  private readonly normalizeTireCode = (code: string): string =>
    code.trim().toUpperCase();

  private readonly normalizeTirePressure = (pressure: number): number =>
    Number(pressure.toFixed(2));

  private readonly normalizeIdentity = (value: string): string =>
    value
      .split('-')
      .map((segment) => segment.trim())
      .filter(Boolean)
      .join(' - ');
  private readonly buildInspectionNumber = (): string => {
    const now = new Date();
    const pad = (value: number): string => value.toString().padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const suffix = nanoid(6).toUpperCase();
    return `INSP-${stamp}-${suffix}`;
  };

  private readonly isMotorcycle = (vehicleType: VehicleType): boolean =>
    vehicleType === VehicleType.MOTOCICLETA_2_TIEMPOS ||
    vehicleType === VehicleType.MOTOCICLETA_4_TIEMPOS;

  private readonly validateTiresForVehicleType = (
    vehicleType: VehicleType | undefined,
    tiresCount: number,
  ): void => {
    if (!vehicleType) {
      return;
    }

    const rules: Record<
      VehicleType,
      { exact?: number; max?: number; label: string }
    > = {
      [VehicleType.MOTOCICLETA_2_TIEMPOS]: {
        exact: 2,
        label: 'motocicleta 2 tiempos',
      },
      [VehicleType.MOTOCICLETA_4_TIEMPOS]: {
        exact: 2,
        label: 'motocicleta 4 tiempos',
      },
      [VehicleType.LIVIANO]: { exact: 4, label: 'vehiculo liviano' },
      [VehicleType.PESADO]: { max: 12, label: 'vehiculo pesado' },
    };

    const rule = rules[vehicleType];
    if (!rule) {
      return;
    }
    if (rule.exact && tiresCount !== rule.exact) {
      throw new BadRequestException(
        `Para ${rule.label} se requieren exactamente ${rule.exact} llantas`,
      );
    }
    if (rule.max && tiresCount > rule.max) {
      throw new BadRequestException(
        `Para ${rule.label} el maximo permitido es ${rule.max} llantas`,
      );
    }
  };
  private readonly validateChecklistByVehicleType = (
    vehicleType: VehicleType | undefined,
    checklist: CreateInspectionDto['checklist'] | UpdateInspectionDto['checklist'],
  ): void => {
    if (!vehicleType || !checklist) {
      return;
    }

    if (typeof checklist.is_clean !== 'boolean') {
      throw new BadRequestException('checklist.is_clean es obligatorio');
    }

    if (this.isMotorcycle(vehicleType)) {
      return;
    }

    const requiredForVehicles: Array<keyof typeof checklist> = [
      'hubcaps_removed',
      'alarms_off',
      'is_unloaded',
      'public_service_seats',
      'seatbelts_visible',
    ];

    const missing = requiredForVehicles.filter(
      (field) => checklist[field] === undefined || checklist[field] === null,
    );

    if (missing.length > 0) {
      throw new BadRequestException(
        `Para ${vehicleType} faltan campos de checklist: ${missing.join(', ')}`,
      );
    }
  };

  constructor(
    private readonly inspectionRepository: InspectionRepository,
    private readonly formDomainValidation: FormDomainValidationService,
    private readonly statusRepository: StatusRepository,
    private readonly socketGateway: SocketGateway,
  ) {}

  private async generateUniqueInspectionNumber(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = this.buildInspectionNumber();
      const exists =
        await this.inspectionRepository.existsByInspectionNumber(candidate);
      if (!exists) {
        return candidate;
      }
    }

    throw new InternalServerErrorException(
      'No fue posible generar un numero de inspeccion unico',
    );
  }

  async create(dto: CreateInspectionDto): Promise<InspectionResponseDto> {
    this.validateTiresForVehicleType(dto.vehicle_type, dto.tires.length);
    this.validateChecklistByVehicleType(dto.vehicle_type, dto.checklist);

    const clientIdForValidation =
      dto.client_id?.trim() || dto.customer_id?.trim();

    await this.formDomainValidation.assertClientAndVehicleExist(
      clientIdForValidation,
      dto.vehicle_id,
    );

    const payload = InspectionMapper.toEntity(dto);
    payload.inspection_number =
      (await this.generateUniqueInspectionNumber());

    const pendingResult = await this.statusRepository.findAll(false, { code: 'PENDING' });
    const pending = pendingResult.data[0];
    payload.statusId = pending?._id.toString();

    const now = new Date();
    payload.date = now;
    payload.inspection_date = now;
    payload.client_id = dto.client_id.trim();
    payload.operator_id = dto.operator_id.trim();
    payload.responsible_id = dto.responsible_id.trim();
    payload.observations = dto.observations?.trim() ?? '';
    payload.signature_url = dto.signature_url?.trim() ?? '';
    payload.fuel_certificate_number = dto.fuel_certificate_number?.trim() ?? '';
    payload.tires = dto.tires.map((tire) => ({
      ...tire,
      code: this.normalizeTireCode(tire.code),
      tire_pressure: this.normalizeTirePressure(tire.tire_pressure),
    }));

    const created = await this.inspectionRepository.create(payload);
    const createDto = InspectionMapper.toResponseDto(created);
    createDto.statusName = await this.resolveStatusName(createDto.statusId);
    return createDto;
  }

  async findAll(
    query: ListInspectionsQueryDto = {},
  ): Promise<PaginatedInspectionResponseDto> {
    const { page, size, ...filters } = query;

    const pagination =
      page !== undefined && size !== undefined
        ? { skip: (page - 1) * size, take: size }
        : undefined;

    const result = await this.inspectionRepository.findAll(
      filters.includeDeleted === 'true',
      {
        inspection_number: filters.inspection_number?.trim(),
        vehicle_id: filters.vehicle_id?.trim(),
      },
      pagination,
    );

    const data = result.data.map(InspectionMapper.toResponseDto);

    const statusIds = [...new Set(data.map(d => d.statusId).filter(Boolean))];
    if (statusIds.length > 0) {
      const statuses = await this.statusRepository.findAll(false, {});
      const statusMap = new Map(statuses.data.map(s => [s._id.toString(), s.name]));
      for (const dto of data) {
        if (dto.statusId) dto.statusName = statusMap.get(dto.statusId) ?? '';
      }
    }

    return new PaginatedInspectionResponseDto({
      data,
      total: result.total,
      page: page ?? 1,
      size: size ?? result.total,
    });
  }

  private async resolveStatusName(statusId?: string): Promise<string | undefined> {
    if (!statusId) return undefined;
    const statuses = await this.statusRepository.findAll(false, {});
    const status = statuses.data.find(s => s._id.toString() === statusId);
    return status?.name;
  }

  async findOne(id: string): Promise<InspectionResponseDto> {
    const inspection = await this.inspectionRepository.findById(id);
    if (!inspection || inspection.deletedAt) {
      throw new NotFoundException(`Inspection with id "${id}" not found`);
    }

    const dto = InspectionMapper.toResponseDto(inspection);
    dto.statusName = await this.resolveStatusName(dto.statusId);
    return dto;
  }

  async update(
    id: string,
    dto: UpdateInspectionDto,
  ): Promise<InspectionResponseDto> {
    const current = await this.inspectionRepository.findById(id);
    if (!current || current.deletedAt) {
      throw new NotFoundException(`Inspection with id "${id}" not found`);
    }

    this.validateTiresForVehicleType(
      dto.vehicle_type ?? current.vehicle_type,
      dto.tires?.length ?? current.tires?.length ?? 0,
    );
    this.validateChecklistByVehicleType(
      dto.vehicle_type ?? current.vehicle_type,
      dto.checklist ?? current.checklist,
    );

    const partialPayload = {
      ...dto,
      client_id: dto.client_id
        ? dto.client_id.trim()
        : undefined,
      operator_id: dto.operator_id
        ? dto.operator_id.trim()
        : undefined,
      responsible_id: dto.responsible_id
        ? dto.responsible_id.trim()
        : undefined,
      observations: dto.observations?.trim(),
      signature_url: dto.signature_url?.trim(),
      fuel_certificate_number: dto.fuel_certificate_number?.trim(),
      tires: dto.tires?.map((tire) => ({
        ...tire,
        code: this.normalizeTireCode(tire.code),
        tire_pressure: this.normalizeTirePressure(tire.tire_pressure),
      })),
    };

    const updated = await this.inspectionRepository.updateById(id, partialPayload);
    if (!updated || updated.deletedAt) {
      throw new NotFoundException(`Inspection with id "${id}" not found`);
    }

    const updateDto = InspectionMapper.toResponseDto(updated);
    updateDto.statusName = await this.resolveStatusName(updateDto.statusId);
    return updateDto;
  }

  async updateChecklistId(
    id: string,
    dto: UpdateChecklistIdDto,
  ): Promise<{ success: boolean }> {
    const current = await this.inspectionRepository.findById(id);
    if (!current || current.deletedAt) {
      throw new NotFoundException(`Inspection with id "${id}" not found`);
    }

    await this.inspectionRepository.updateById(id, {
      checklistId: dto.checklistId,
    });

    return { success: true };
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.inspectionRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Inspection with id "${id}" not found`);
    }

    return { deleted };
  }

  async updateInspectionStatus(
    id: string,
    dto: UpdateInspectionStatusDto,
  ): Promise<{ success: boolean }> {
    const current = await this.inspectionRepository.findById(id);
    if (!current || current.deletedAt) {
      throw new NotFoundException(`Inspection with id "${id}" not found`);
    }

    const status = await this.statusRepository.findById(dto.statusId);
    if (!status || !status.isActive) {
      throw new BadRequestException(`Status with id "${dto.statusId}" not found or inactive`);
    }

    await this.inspectionRepository.updateById(id, {
      statusId: dto.statusId,
    });

    const updated = await this.inspectionRepository.findById(id);
    if (updated) {
      const updatedDto = InspectionMapper.toResponseDto(updated);
      updatedDto.statusName = status.name;
      this.socketGateway.emitInspectionStatusUpdated(updatedDto as any);
    }

    return { success: true };
  }
}
