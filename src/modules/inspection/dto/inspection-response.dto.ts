import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BrakeFluidSightGlass } from '../../../shared/types/brake-fluid-sight-glass.enum';
import { CustomerType } from '../../../shared/types/customer-type.enum';
import { RevisionType } from '../../../shared/types/revision-type.enum';
import { TernaryChoice } from '../../../shared/types/ternary-choice.enum';
import { TirePosition } from '../../../shared/types/tire-position.enum';
import { VehicleType } from '../../../shared/types/vehicle-type.enum';

export class ChecklistResponseDto {
  @ApiProperty()
  is_clean: boolean;
  @ApiPropertyOptional()
  hubcaps_removed?: boolean;
  @ApiPropertyOptional()
  alarms_off?: boolean;
  @ApiPropertyOptional()
  is_unloaded?: boolean;
  @ApiPropertyOptional()
  public_service_seats?: number;
  @ApiPropertyOptional()
  seatbelts_visible?: boolean;
}

export class AxleResponseDto {
  @ApiProperty()
  index: number;
  @ApiProperty()
  axle_type: string;
}

export class TireResponseDto {
  @ApiProperty({ enum: TirePosition })
  position: TirePosition;
  @ApiProperty()
  code: string;
  @ApiProperty()
  tire_pressure: number;
}

export class InspectionResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  inspection_number: string;
  @ApiProperty()
  mileage: number;
  @ApiProperty()
  date: string;
  @ApiProperty()
  inspection_date: string;
  @ApiProperty()
  client_id: string;
  @ApiProperty()
  vehicle_id: string;
  @ApiPropertyOptional({ enum: VehicleType })
  vehicle_type?: VehicleType;
  @ApiProperty()
  operator_id: string;
  @ApiProperty()
  responsible_id: string;
  @ApiProperty()
  customer_id: string;
  @ApiProperty({ enum: CustomerType })
  customer_type: CustomerType;
  @ApiProperty({ enum: RevisionType })
  revision_type: RevisionType;
  @ApiProperty({ enum: TernaryChoice })
  tinted_windows: TernaryChoice;
  @ApiProperty({ enum: TernaryChoice })
  armored_vehicle: TernaryChoice;
  @ApiProperty({ enum: BrakeFluidSightGlass })
  brake_fluid_sight_glass: BrakeFluidSightGlass;
  @ApiPropertyOptional()
  observations?: string;
  @ApiPropertyOptional()
  signature_url?: string;
  @ApiProperty()
  photo_reception_url: string;
  @ApiProperty({ type: ChecklistResponseDto })
  checklist: ChecklistResponseDto;
  @ApiProperty({ type: [AxleResponseDto] })
  axles: AxleResponseDto[];
  @ApiProperty({ type: [TireResponseDto] })
  tires: TireResponseDto[];
  @ApiPropertyOptional()
  deletedAt?: string | null;
}
