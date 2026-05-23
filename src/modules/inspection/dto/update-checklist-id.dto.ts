import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateChecklistIdDto {
  @ApiProperty({ description: 'ID del checklist a asignar a la inspeccion' })
  @IsString()
  @IsNotEmpty()
  checklistId: string;
}
