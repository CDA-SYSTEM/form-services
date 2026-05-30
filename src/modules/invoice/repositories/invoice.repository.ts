import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { Invoice } from '../../../shared/entities/invoice.entity';

type InvoiceFilters = {
  invoice_number?: string;
  statusId?: string;
};

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly repository: MongoRepository<Invoice>,
  ) {}

  create = async (data: Partial<Invoice>): Promise<Invoice> => {
    const result = await this.repository.insertOne(data as any);
    const created = await this.findById(result.insertedId.toString());
    return created as Invoice;
  };

  findAll = async (
    includeDeleted = false,
    filters?: InvoiceFilters,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: Invoice[]; total: number }> => {
    const baseWhere: Record<string, unknown> = {};
    if (!includeDeleted) {
      baseWhere.deletedAt = null;
    }
    if (filters?.invoice_number) {
      baseWhere.invoice_number = filters.invoice_number;
    }
    if (filters?.statusId) {
      baseWhere.statusId = filters.statusId;
    }

    const total = await this.repository.countDocuments(baseWhere as any);

    let cursor = this.repository
      .createCursor(baseWhere as any)
      .sort({ createdAt: -1 });

    if (pagination) {
      cursor = cursor.skip(pagination.skip).limit(pagination.take);
    }

    const documents = await cursor.toArray();

    return { data: documents as Invoice[], total };
  };

  findById = async (id: string): Promise<Invoice | null> => {
    if (!ObjectId.isValid(id)) return null;
    const document = await this.repository
      .createCursor({ _id: new ObjectId(id) } as any)
      .next();
    return (document as Invoice) ?? null;
  };

  updateById = async (
    id: string,
    data: Partial<Invoice>,
  ): Promise<Invoice | null> => {
    const current = await this.findById(id);
    if (!current) return null;

    await this.repository.updateOne(
      { _id: new ObjectId(id) },
      { $set: data as any },
    );
    return this.findById(id);
  };

  softDelete = async (id: string): Promise<boolean> => {
    const current = await this.findById(id);
    if (!current || current.deletedAt) return false;

    await this.repository.updateOne(
      { _id: new ObjectId(id) },
      { $set: { deletedAt: new Date() } },
    );
    return true;
  };

  existsByInvoiceNumber = async (
    invoiceNumber: string,
  ): Promise<boolean> => {
    const total = await this.repository.countDocuments({
      invoice_number: invoiceNumber,
    });
    return total > 0;
  };
}
