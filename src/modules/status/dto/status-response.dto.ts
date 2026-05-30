import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StatusResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  color?: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  deletedAt?: string | null;
}
