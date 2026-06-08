import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceClientResponseDto {
  @ApiProperty()
  document: string;
  @ApiProperty()
  name: string;
  @ApiPropertyOptional()
  address?: string;
  @ApiPropertyOptional()
  phone?: string;
  @ApiPropertyOptional()
  email?: string;
}

export class InvoiceItemResponseDto {
  @ApiProperty()
  concept: string;
  @ApiProperty()
  quantity: number;
  @ApiProperty()
  unitPrice: number;
  @ApiProperty()
  total: number;
}

export class InvoiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  invoice_number: string;

  @ApiProperty({ type: InvoiceClientResponseDto })
  client: InvoiceClientResponseDto;

  @ApiProperty({ type: [InvoiceItemResponseDto] })
  items: InvoiceItemResponseDto[];

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  statusId: string;

  @ApiPropertyOptional()
  statusName?: string;

  @ApiProperty()
  inspection_id: string;

  @ApiPropertyOptional()
  observations?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  deletedAt?: string | null;

  @ApiPropertyOptional()
  urlInvoice?: string;
}
