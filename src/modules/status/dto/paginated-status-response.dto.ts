import { ApiProperty } from '@nestjs/swagger';
import { StatusResponseDto } from './status-response.dto';

export class PaginatedStatusResponseDto {
  @ApiProperty({ type: StatusResponseDto, isArray: true })
  data: StatusResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  size: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  constructor(partial: Partial<PaginatedStatusResponseDto>) {
    Object.assign(this, partial);
    if (this.total !== undefined && this.size !== undefined && this.size > 0) {
      this.totalPages = Math.ceil(this.total / this.size);
    }
  }
}
