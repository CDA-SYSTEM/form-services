import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { InspectionResponseDto } from './dto/inspection-response.dto';
import { ListInspectionsQueryDto } from './dto/list-inspections-query.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { InspectionMapper } from './mappers/inspection.mapper';
import { InspectionRepository } from './repositories/inspection.repository';
import { VehicleType } from '../../shared/types/vehicle-type.enum';

@Injectable()
export class InspectionService {
  private readonly normalizeTireCode = (code: string): string =>
    code.trim().toUpperCase();

  private readonly normalizeTirePressure = (pressure: number): number =>
    Number(pressure.toFixed(2));

  private readonly normalizeDate = (date: string): Date => new Date(date);
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
    const suffix = Math.random().toString(36).toUpperCase().slice(2, 6);
    return `INSP-${stamp}-${suffix}`;
  };
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
      [VehicleType.MOTOCICLETA]: { exact: 2, label: 'motocicleta' },
      [VehicleType.VEHICULO_LIVIANO]: { exact: 4, label: 'vehiculo liviano' },
      [VehicleType.VEHICULO_PESADO]: { max: 12, label: 'vehiculo pesado' },
    };

    const rule = rules[vehicleType];
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

    if (vehicleType === VehicleType.MOTOCICLETA) {
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

  constructor(private readonly inspectionRepository: InspectionRepository) {}

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

    const payload = InspectionMapper.toEntity(dto);
    payload.inspection_number =
      dto.inspection_number?.trim() || (await this.generateUniqueInspectionNumber());
    payload.date = this.normalizeDate(dto.date);
    payload.inspection_date = this.normalizeDate(dto.inspection_date);
    payload.client_id = this.normalizeIdentity(dto.client_id);
    payload.operator_id = this.normalizeIdentity(dto.operator_id);
    payload.responsible_id = this.normalizeIdentity(dto.responsible_id);
    payload.observations = dto.observations?.trim() ?? '';
    payload.signature_url = dto.signature_url?.trim() ?? '';
    payload.tires = dto.tires.map((tire) => ({
      ...tire,
      code: this.normalizeTireCode(tire.code),
      tire_pressure: this.normalizeTirePressure(tire.tire_pressure),
    }));

    const created = await this.inspectionRepository.create(payload);
    return InspectionMapper.toResponseDto(created);
  }

  async findAll(
    query: ListInspectionsQueryDto = {},
  ): Promise<InspectionResponseDto[]> {
    const inspections = await this.inspectionRepository.findAll(
      query.includeDeleted === 'true',
      {
        inspection_number: query.inspection_number?.trim(),
        vehicle_id: query.vehicle_id?.trim(),
      },
    );
    return inspections.map(InspectionMapper.toResponseDto);
  }

  async findOne(id: string): Promise<InspectionResponseDto> {
    const inspection = await this.inspectionRepository.findById(id);
    if (!inspection || inspection.deletedAt) {
      throw new NotFoundException(`Inspection with id "${id}" not found`);
    }

    return InspectionMapper.toResponseDto(inspection);
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
    if (
      dto.inspection_number &&
      dto.inspection_number.trim() !== current.inspection_number
    ) {
      const exists = await this.inspectionRepository.existsByInspectionNumber(
        dto.inspection_number.trim(),
      );
      if (exists) {
        throw new BadRequestException(
          `El numero de inspeccion "${dto.inspection_number.trim()}" ya existe`,
        );
      }
    }

    const partialPayload = {
      ...dto,
      inspection_number: dto.inspection_number?.trim(),
      date: dto.date ? this.normalizeDate(dto.date) : undefined,
      inspection_date: dto.inspection_date
        ? this.normalizeDate(dto.inspection_date)
        : undefined,
      client_id: dto.client_id
        ? this.normalizeIdentity(dto.client_id)
        : undefined,
      operator_id: dto.operator_id
        ? this.normalizeIdentity(dto.operator_id)
        : undefined,
      responsible_id: dto.responsible_id
        ? this.normalizeIdentity(dto.responsible_id)
        : undefined,
      observations: dto.observations?.trim(),
      signature_url: dto.signature_url?.trim(),
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

    return InspectionMapper.toResponseDto(updated);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.inspectionRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Inspection with id "${id}" not found`);
    }

    return { deleted };
  }
}
