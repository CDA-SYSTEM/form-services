import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '../../../shared/types/vehicle-type.enum';
import { RevisionType } from '../../../shared/types/revision-type.enum';

export class PriceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: VehicleType })
  vehicleType: VehicleType;

  @ApiProperty({ enum: RevisionType })
  revisionType: RevisionType;

  @ApiProperty()
  amount: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  deletedAt?: string | null;
}
