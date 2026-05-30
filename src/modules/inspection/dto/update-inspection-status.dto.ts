import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateInspectionStatusDto {
  @ApiProperty({ description: 'ID del estado a asignar a la inspeccion' })
  @IsString()
  @IsNotEmpty()
  statusId: string;
}
