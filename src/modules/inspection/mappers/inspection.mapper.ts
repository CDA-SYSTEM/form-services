import { CreateInspectionDto } from '../dto/create-inspection.dto';
import { InspectionResponseDto } from '../dto/inspection-response.dto';
import { Inspection } from '../../../shared/entities/inspection.entity';

export class InspectionMapper {
  static toEntity(dto: CreateInspectionDto): Partial<Inspection> {
    return {
      ...dto,
      date: new Date(dto.date),
      inspection_date: new Date(dto.inspection_date),
      deletedAt: null,
    };
  }

  static toResponseDto(entity: Inspection): InspectionResponseDto {
    return {
      id: entity._id.toString(),
      inspection_number: entity.inspection_number,
      mileage: entity.mileage,
      date: entity.date ? entity.date.toISOString() : '',
      inspection_date: entity.inspection_date
        ? entity.inspection_date.toISOString()
        : '',
      client_id: entity.client_id,
      vehicle_id: entity.vehicle_id,
      vehicle_type: entity.vehicle_type,
      operator_id: entity.operator_id,
      responsible_id: entity.responsible_id,
      customer_id: entity.customer_id,
      customer_type: entity.customer_type,
      revision_type: entity.revision_type,
      tinted_windows: entity.tinted_windows,
      armored_vehicle: entity.armored_vehicle,
      brake_fluid_sight_glass: entity.brake_fluid_sight_glass,
      observations: entity.observations,
      signature_url: entity.signature_url,
      photo_reception_url: entity.photo_reception_url,
      checklist: entity.checklist,
      axles: entity.axles,
      tires: entity.tires,
      deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
    };
  }
}
