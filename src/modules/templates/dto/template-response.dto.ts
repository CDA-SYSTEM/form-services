import { ApiProperty } from '@nestjs/swagger';
import { TemplateType } from '../../../shared/entities/invoice-template.entity';

export class TemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  typeCode: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
