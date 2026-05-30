import { ApiProperty } from '@nestjs/swagger';
import { PriceResponseDto } from './price-response.dto';

export class PaginatedPriceResponseDto {
  @ApiProperty({ type: PriceResponseDto, isArray: true })
  data: PriceResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  size: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  constructor(partial: Partial<PaginatedPriceResponseDto>) {
    Object.assign(this, partial);
    if (this.total !== undefined && this.size !== undefined && this.size > 0) {
      this.totalPages = Math.ceil(this.total / this.size);
    }
  }
}
