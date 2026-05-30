import { Injectable } from '@nestjs/common';
import { InvoiceResponseDto } from '../dto/invoice-response.dto';
import { InvoiceService } from '../invoice.service';

@Injectable()
export class FindOneInvoiceUseCase {
  constructor(private readonly invoiceService: InvoiceService) {}

  execute = (id: string): Promise<InvoiceResponseDto> =>
    this.invoiceService.findOne(id);
}
