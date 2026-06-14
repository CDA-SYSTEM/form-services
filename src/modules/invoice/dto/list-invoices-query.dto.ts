import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ListInvoicesQueryDto {
  @ApiPropertyOptional({ description: 'Incluye registros con soft delete' })
  @IsOptional()
  @IsBooleanString()
  includeDeleted?: string;

  @ApiPropertyOptional({ description: 'Filtrar por numero de factura' })
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @ApiPropertyOptional({
    description:
      'Busqueda parcial por numero de factura, nombre o documento del cliente',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de estado' })
  @IsOptional()
  @IsString()
  statusId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de inspeccion' })
  @IsOptional()
  @IsString()
  inspection_id?: string;

  @ApiPropertyOptional({ description: 'Numero de pagina (empieza en 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Cantidad de elementos por pagina' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number;
}
