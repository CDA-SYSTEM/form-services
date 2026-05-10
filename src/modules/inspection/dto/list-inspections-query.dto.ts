import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ListInspectionsQueryDto {
  @ApiPropertyOptional({
    description: 'Incluye registros con soft delete',
    example: 'false',
  })
  @IsOptional()
  @IsBooleanString()
  includeDeleted?: string;

  @ApiPropertyOptional({ description: 'Filtrar por numero de inspeccion' })
  @IsOptional()
  @IsString()
  inspection_number?: string;

  @ApiPropertyOptional({ description: 'Filtrar por placa del vehiculo' })
  @IsOptional()
  @IsString()
  vehicle_id?: string;

  @ApiPropertyOptional({
    description: 'Numero de pagina (empieza en 1)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por pagina',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number;
}
