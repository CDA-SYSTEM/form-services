import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Factura Estándar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'INVOICE' })
  @IsString()
  @IsNotEmpty()
  typeCode: string;

  @ApiProperty({ example: '<html><body><h1>Factura {{invoice.number}}</h1></body></html>' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
