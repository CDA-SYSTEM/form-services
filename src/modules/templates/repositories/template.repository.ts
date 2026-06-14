import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { InvoiceTemplate } from '../../../shared/entities/invoice-template.entity';

@Injectable()
export class TemplateRepository {
  constructor(
    @InjectRepository(InvoiceTemplate)
    private readonly repository: MongoRepository<InvoiceTemplate>,
  ) {}

  async create(data: Partial<InvoiceTemplate>): Promise<InvoiceTemplate> {
    const result = await this.repository.insertOne(data as any);
    const created = await this.findById(result.insertedId.toString());
    return created as InvoiceTemplate;
  }

  async findById(id: string): Promise<InvoiceTemplate | null> {
    if (!ObjectId.isValid(id)) return null;
    const document = await this.repository
      .createCursor({ _id: new ObjectId(id) } as any)
      .next();
    return (document as InvoiceTemplate) ?? null;
  }

  async findAll(typeCode?: string): Promise<InvoiceTemplate[]> {
    const filter: any = {};
    if (typeCode) {
      filter.typeCode = typeCode;
    }
    const cursor = this.repository.createCursor(filter).sort({ createdAt: -1 });
    return (await cursor.toArray()) as InvoiceTemplate[];
  }

  async findActiveByType(typeCode: string): Promise<InvoiceTemplate | null> {
    const document = await this.repository
      .createCursor({ typeCode, isActive: true } as any)
      .next();
    return (document as InvoiceTemplate) ?? null;
  }

  async updateById(
    id: string,
    data: Partial<InvoiceTemplate>,
  ): Promise<InvoiceTemplate | null> {
    if (!ObjectId.isValid(id)) return null;
    await this.repository.updateOne(
      { _id: new ObjectId(id) },
      { $set: data as any },
    );
    return this.findById(id);
  }

  async deactivateAllByType(typeCode: string): Promise<void> {
    await this.repository.updateMany(
      { typeCode, isActive: true },
      { $set: { isActive: false } as any },
    );
  }

  async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.repository.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}
