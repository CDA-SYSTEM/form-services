import { Injectable } from '@nestjs/common';
import { ListInvoicesQueryDto } from '../dto/list-invoices-query.dto';
import { PaginatedInvoiceResponseDto } from '../dto/paginated-invoice-response.dto';
import { InvoiceService } from '../invoice.service';

@Injectable()
export class FindAllInvoicesUseCase {
  constructor(private readonly invoiceService: InvoiceService) {}

  execute = (
    query: ListInvoicesQueryDto,
  ): Promise<PaginatedInvoiceResponseDto> =>
    this.invoiceService.findAll(query);
}
