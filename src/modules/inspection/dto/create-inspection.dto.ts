import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BrakeFluidSightGlass } from '../../../shared/types/brake-fluid-sight-glass.enum';
import { CustomerType } from '../../../shared/types/customer-type.enum';
import { RevisionType } from '../../../shared/types/revision-type.enum';
import { TernaryChoice } from '../../../shared/types/ternary-choice.enum';
import { TirePosition } from '../../../shared/types/tire-position.enum';
import { FuelType } from '../../../shared/types/fuel-type.enum';
import { ServiceType } from '../../../shared/types/service-type.enum';
import { VehicleType } from '../../../shared/types/vehicle-type.enum';

export class ChecklistDto {
  @ApiProperty({
    description:
      'Confirma limpieza del vehiculo. Para motocicleta este es el unico campo obligatorio de checklist.',
    example: true,
  })
  @IsBoolean()
  is_clean: boolean;

  @ApiPropertyOptional({
    description:
      'Indica si se retiraron copas/tapas. Requerido para VEHICULO_LIVIANO y VEHICULO_PESADO.',
  })
  @IsOptional()
  @IsBoolean()
  hubcaps_removed?: boolean;

  @ApiPropertyOptional({
    description:
      'Indica si las alarmas estan desactivadas. Requerido para VEHICULO_LIVIANO y VEHICULO_PESADO.',
  })
  @IsOptional()
  @IsBoolean()
  alarms_off?: boolean;

  @ApiPropertyOptional({
    description:
      'Confirma que el vehiculo esta descargado. Requerido para VEHICULO_LIVIANO y VEHICULO_PESADO.',
  })
  @IsOptional()
  @IsBoolean()
  is_unloaded?: boolean;

  @ApiPropertyOptional({
    description:
      'Cantidad de asientos de servicio publico visibles. Requerido para VEHICULO_LIVIANO y VEHICULO_PESADO.',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  public_service_seats?: number;

  @ApiPropertyOptional({
    description:
      'Confirma que los cinturones sean visibles. Requerido para VEHICULO_LIVIANO y VEHICULO_PESADO.',
  })
  @IsOptional()
  @IsBoolean()
  seatbelts_visible?: boolean;
}

export class AxleDto {
  @ApiProperty({
    description: 'Numero de eje. Debe iniciar en 1.',
    example: 1,
  })
  @IsInt()
  @Min(1)
  index: number;

  @ApiProperty({
    description: 'Tipo de eje (ej: DELANTERO, TRASERO, MOTRIZ).',
    example: 'DELANTERO',
  })
  @IsString()
  @IsNotEmpty()
  axle_type: string;
}

export class TireDto {
  @ApiProperty({
    enum: TirePosition,
    description: 'Posicion de la llanta en el vehiculo.',
    example: TirePosition.FRONT_LEFT,
  })
  @IsEnum(TirePosition)
  position: TirePosition;

  @ApiProperty({
    description: 'Codigo o serial de la llanta.',
    example: 'MXA12345',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Presion de la llanta en PSI (hasta 2 decimales).',
    example: 32.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  tire_pressure: number;
}

export class CreateInspectionDto {
  // inspection_number/date/inspection_date se generan automaticamente en el backend

  @ApiProperty()
  @IsNumber()
  @Min(0)
  mileage: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicle_id: string;

  @ApiPropertyOptional({
    enum: VehicleType,
    description:
      'Opcional. Si se envia: MOTOCICLETA (2T/4T) exige 2 llantas, LIVIANO exige 4, PESADO permite hasta 12.',
  })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicle_type?: VehicleType;

  @ApiPropertyOptional({
    enum: FuelType,
    description: 'Tipo de combustible.',
  })
  @IsOptional()
  @IsEnum(FuelType)
  fuel_type?: FuelType;

  @ApiPropertyOptional({
    description:
      'Numero de certificado. Recomendado si fuel_type es GAS o GAS_GASOLINA.',
    example: 'CERT-12345',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fuel_certificate_number?: string;

  @ApiPropertyOptional({
    enum: ServiceType,
    description: 'Tipo de servicio.',
  })
  @IsOptional()
  @IsEnum(ServiceType)
  service_type?: ServiceType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  operator_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  responsible_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customer_id: string;

  @ApiProperty({ enum: CustomerType })
  @IsEnum(CustomerType)
  customer_type: CustomerType;

  @ApiProperty({ enum: RevisionType })
  @IsEnum(RevisionType)
  revision_type: RevisionType;

  @ApiProperty({ enum: TernaryChoice })
  @IsEnum(TernaryChoice)
  tinted_windows: TernaryChoice;

  @ApiProperty({ enum: TernaryChoice })
  @IsEnum(TernaryChoice)
  armored_vehicle: TernaryChoice;

  @ApiProperty({ enum: BrakeFluidSightGlass })
  @IsEnum(BrakeFluidSightGlass)
  brake_fluid_sight_glass: BrakeFluidSightGlass;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  signature_url?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  photo_reception_url: string;

  @ApiProperty({ type: ChecklistDto })
  @ValidateNested()
  @Type(() => ChecklistDto)
  checklist: ChecklistDto;

  @ApiProperty({
    type: [AxleDto],
    description:
      'Ejes del vehiculo inspeccionado. Cada item representa un eje fisico. Ejemplos: 1-DELANTERO, 2-TRASERO.',
    example: [
      { index: 1, axle_type: 'DELANTERO' },
      { index: 2, axle_type: 'TRASERO' },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AxleDto)
  axles: AxleDto[];

  @ApiProperty({
    type: [TireDto],
    description:
      'Llantas inspeccionadas. Cada item representa UNA llanta real (posicion, codigo y presion). Reglas: MOTOCICLETA=2, VEHICULO_LIVIANO=4, VEHICULO_PESADO=hasta 12. Para pesados puedes usar posiciones TIRE_1..TIRE_12.',
    example: [
      {
        position: TirePosition.FRONT_LEFT,
        code: 'MXA12345',
        tire_pressure: 32.5,
      },
      {
        position: TirePosition.FRONT_RIGHT,
        code: 'MXA12346',
        tire_pressure: 32.0,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TireDto)
  tires: TireDto[];
}
