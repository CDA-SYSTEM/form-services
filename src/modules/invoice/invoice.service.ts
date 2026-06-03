import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { ListInvoicesQueryDto } from './dto/list-invoices-query.dto';
import { PaginatedInvoiceResponseDto } from './dto/paginated-invoice-response.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceMapper } from './mappers/invoice.mapper';
import { InvoiceRepository } from './repositories/invoice.repository';
import { InspectionRepository } from '../inspection/repositories/inspection.repository';
import { InspectionService } from '../inspection/inspection.service';
import { SocketGateway } from '../socket/socket.gateway';
import { StatusRepository } from '../status/repositories/status.repository';
import { nanoid } from 'nanoid';

@Injectable()
export class InvoiceService {
  private statusCache: Map<string, string> | null = null;

  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly inspectionRepository: InspectionRepository,
    private readonly inspectionService: InspectionService,
    private readonly socketGateway: SocketGateway,
    private readonly statusRepository: StatusRepository,
  ) {}

  private resolveStatusName = async (statusId?: string): Promise<string | undefined> => {
    if (!statusId) return undefined;
    if (!this.statusCache) {
      const statuses = await this.statusRepository.findAll(false, {});
      this.statusCache = new Map(statuses.data.map((s) => [s._id.toString(), s.name]));
    }
    return this.statusCache.get(statusId);
  };

  private buildInvoiceNumber = (): string => {
    const now = new Date();
    const pad = (value: number): string => value.toString().padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const suffix = nanoid(6).toUpperCase();
    return `INV-${stamp}-${suffix}`;
  };

  private generateUniqueInvoiceNumber = async (): Promise<string> => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = this.buildInvoiceNumber();
      const exists =
        await this.invoiceRepository.existsByInvoiceNumber(candidate);
      if (!exists) return candidate;
    }
    throw new InternalServerErrorException(
      'No fue posible generar un numero de factura unico',
    );
  };

  private calculateItemTotal = (item: {
    quantity: number;
    unitPrice: number;
  }): number => Number((item.quantity * item.unitPrice).toFixed(2));

  private calculateInvoiceTotals = (items: CreateInvoiceDto['items']) => {
    const subtotal = Number(
      items
        .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
        .toFixed(2),
    );
    const tax = Number((subtotal * 0).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    return { subtotal, tax, total };
  };

  private assertInspectionExists = async (id: string): Promise<void> => {
    const inspection = await this.inspectionRepository.findById(id);
    if (!inspection || inspection.deletedAt) {
      throw new BadRequestException(
        `La inspeccion con id "${id}" no existe`,
      );
    }
  };

  private assertNoInvoiceForInspection = async (inspectionId: string): Promise<void> => {
    const exists = await this.invoiceRepository.existsByInspectionId(inspectionId);
    if (exists) {
      throw new BadRequestException(
        `Ya existe una factura para la inspeccion "${inspectionId}"`,
      );
    }
  };

  create = async (dto: CreateInvoiceDto): Promise<InvoiceResponseDto> => {
    await this.assertInspectionExists(dto.inspection_id);
    await this.assertNoInvoiceForInspection(dto.inspection_id);

    const payload = InvoiceMapper.toEntity(dto);
    payload.invoice_number = await this.generateUniqueInvoiceNumber();

    const now = new Date();
    payload.createdAt = now;
    payload.updatedAt = now;

    payload.items = dto.items.map((item) => ({
      ...item,
      total: this.calculateItemTotal(item),
    }));

    const totals = this.calculateInvoiceTotals(payload.items);
    payload.subtotal = totals.subtotal;
    payload.tax = totals.tax;
    payload.total = totals.total;

    const created = await this.invoiceRepository.create(payload);
    const responseDto = InvoiceMapper.toResponseDto(created);
    this.socketGateway.emitInvoiceCreated(responseDto as any);
    return responseDto;
  };

  findAll = async (
    query: ListInvoicesQueryDto = {},
  ): Promise<PaginatedInvoiceResponseDto> => {
    const { page, size, ...filters } = query;

    const pagination =
      page !== undefined && size !== undefined
        ? { skip: (page - 1) * size, take: size }
        : undefined;

    const result = await this.invoiceRepository.findAll(
      filters.includeDeleted === 'true',
      {
        invoice_number: filters.invoice_number?.trim(),
        statusId: filters.statusId?.trim(),
        inspection_id: filters.inspection_id?.trim(),
      },
      pagination,
    );

    this.statusCache = null;
    const data = await Promise.all(
      result.data.map(async (entity) => {
        const dto = InvoiceMapper.toResponseDto(entity);
        dto.statusName = await this.resolveStatusName(dto.statusId);
        return dto;
      }),
    );

    return new PaginatedInvoiceResponseDto({
      data,
      total: result.total,
      page: page ?? 1,
      size: size ?? result.total,
    });
  };

  findOne = async (id: string): Promise<InvoiceResponseDto> => {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice || invoice.deletedAt) {
      throw new NotFoundException(`Invoice with id "${id}" not found`);
    }
    const dto = InvoiceMapper.toResponseDto(invoice);
    dto.statusName = await this.resolveStatusName(dto.statusId);
    return dto;
  };

  update = async (
    id: string,
    dto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> => {
    const current = await this.invoiceRepository.findById(id);
    if (!current || current.deletedAt) {
      throw new NotFoundException(`Invoice with id "${id}" not found`);
    }

    if (dto.inspection_id) {
      await this.assertInspectionExists(dto.inspection_id);
    }

    if (dto.statusId) {
      await this.inspectionService.updateInspectionStatus(current.inspection_id, {
        statusId: dto.statusId,
      });
    }

    const partialPayload: any = {
      ...dto,
      updatedAt: new Date(),
    };

    if (dto.items) {
      partialPayload.items = dto.items.map((item) => ({
        ...item,
        total: this.calculateItemTotal(item),
      }));
      const totals = this.calculateInvoiceTotals(partialPayload.items);
      partialPayload.subtotal = totals.subtotal;
      partialPayload.tax = totals.tax;
      partialPayload.total = totals.total;
    }

    const updated = await this.invoiceRepository.updateById(
      id,
      partialPayload,
    );
    if (!updated || updated.deletedAt) {
      throw new NotFoundException(`Invoice with id "${id}" not found`);
    }

    const updatedDto = InvoiceMapper.toResponseDto(updated);
    this.socketGateway.emitInvoiceUpdated(updatedDto as any);
    return updatedDto;
  };

  remove = async (id: string): Promise<{ deleted: boolean }> => {
    const deleted = await this.invoiceRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Invoice with id "${id}" not found`);
    }
    return { deleted };
  };
}
