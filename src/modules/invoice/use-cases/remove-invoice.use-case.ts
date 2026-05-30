import { Injectable } from '@nestjs/common';
import { InvoiceService } from '../invoice.service';

@Injectable()
export class RemoveInvoiceUseCase {
  constructor(private readonly invoiceService: InvoiceService) {}

  execute = (id: string): Promise<{ deleted: boolean }> =>
    this.invoiceService.remove(id);
}
