import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { InvoiceResponseDto } from '../dto/invoice-response.dto';
import { InvoiceService } from '../invoice.service';

@Injectable()
export class CreateInvoiceUseCase {
  constructor(private readonly invoiceService: InvoiceService) {}

  execute = (dto: CreateInvoiceDto): Promise<InvoiceResponseDto> =>
    this.invoiceService.create(dto);
}
