import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStatusDto {
  @ApiProperty({ example: 'PENDING', description: 'Codigo unico del estado' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Pendiente', description: 'Nombre visible del estado' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Descripcion del estado' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#F59E0B', description: 'Color hex' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 1, description: 'Orden de visualizacion' })
  @IsNumber()
  @Min(0)
  order: number;

  @ApiProperty({ example: true, description: 'Si esta activo' })
  @IsBoolean()
  isActive: boolean;
}
