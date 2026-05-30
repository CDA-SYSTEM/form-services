import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { InvoiceResponseDto } from '../dto/invoice-response.dto';
import { Invoice } from '../../../shared/entities/invoice.entity';

export class InvoiceMapper {
  static toEntity = (dto: CreateInvoiceDto): Partial<Invoice> => ({
    ...dto,
    deletedAt: null,
  });

  static toResponseDto = (entity: Invoice): InvoiceResponseDto => ({
    id: entity._id.toString(),
    invoice_number: entity.invoice_number,
    client: entity.client,
    items: entity.items,
    subtotal: entity.subtotal,
    tax: entity.tax,
    total: entity.total,
    statusId: entity.statusId,
    inspection_id: entity.inspection_id,
    observations: entity.observations,
    createdAt: entity.createdAt?.toISOString() ?? '',
    updatedAt: entity.updatedAt?.toISOString() ?? '',
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
  });
}
