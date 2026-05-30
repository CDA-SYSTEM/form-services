import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '../../../shared/types/vehicle-type.enum';
import { RevisionType } from '../../../shared/types/revision-type.enum';

export class CreatePriceDto {
  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @ApiProperty({ enum: RevisionType })
  @IsEnum(RevisionType)
  revisionType: RevisionType;

  @ApiProperty({ example: 150000, description: 'Precio en pesos' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Descripcion del precio' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}
