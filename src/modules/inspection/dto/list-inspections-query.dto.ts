import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';

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
}
