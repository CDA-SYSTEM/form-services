import { ApiProperty } from '@nestjs/swagger';
import { InvoiceResponseDto } from './invoice-response.dto';

export class PaginatedInvoiceResponseDto {
  @ApiProperty({ type: InvoiceResponseDto, isArray: true })
  data: InvoiceResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  size: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  constructor(partial: Partial<PaginatedInvoiceResponseDto>) {
    Object.assign(this, partial);
    if (this.total !== undefined && this.size !== undefined && this.size > 0) {
      this.totalPages = Math.ceil(this.total / this.size);
    }
  }
}
