import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../../shared/entities/status.entity';

export class StatusInfoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  color?: string;

  static fromEntity(entity: Status): StatusInfoResponseDto {
    return {
      id: entity._id.toString(),
      code: entity.code,
      name: entity.name,
      color: entity.color,
    };
  }
}
