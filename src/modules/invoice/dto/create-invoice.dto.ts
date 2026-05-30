import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceClientDto {
  @ApiProperty({ example: '1234567890', description: 'Documento del cliente' })
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiProperty({ example: 'Carlos Perez', description: 'Nombre del cliente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Calle 123 #45-67' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'carlos@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class InvoiceItemDto {
  @ApiProperty({ example: 'Revision tecnico-mecanica', description: 'Concepto' })
  @IsString()
  @IsNotEmpty()
  concept: string;

  @ApiProperty({ example: 1, description: 'Cantidad' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 150000, description: 'Precio unitario' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ type: InvoiceClientDto, description: 'Datos del cliente' })
  @ValidateNested()
  @Type(() => InvoiceClientDto)
  client: InvoiceClientDto;

  @ApiProperty({
    type: [InvoiceItemDto],
    description: 'Items/conceptos de la factura',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiProperty({ example: 'STATUS_ID', description: 'ID del estado' })
  @IsString()
  @IsNotEmpty()
  statusId: string;

  @ApiPropertyOptional({ description: 'ID de la inspeccion relacionada' })
  @IsOptional()
  @IsString()
  inspection_id?: string;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsOptional()
  @IsString()
  observations?: string;
}
