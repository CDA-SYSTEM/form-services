import { Injectable } from '@nestjs/common';
import { InvoiceResponseDto } from '../dto/invoice-response.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { InvoiceService } from '../invoice.service';

@Injectable()
export class UpdateInvoiceUseCase {
  constructor(private readonly invoiceService: InvoiceService) {}

  execute = (id: string, dto: UpdateInvoiceDto): Promise<InvoiceResponseDto> =>
    this.invoiceService.update(id, dto);
}
