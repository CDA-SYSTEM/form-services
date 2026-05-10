import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { Inspection } from '../../../shared/entities/inspection.entity';

type InspectionFilters = {
  inspection_number?: string;
  vehicle_id?: string;
};

@Injectable()
export class InspectionRepository {
  constructor(
    @InjectRepository(Inspection)
    private readonly repository: MongoRepository<Inspection>,
  ) {}

  private readonly toEmbeddedArray = (value: any): any[] => {
    if (Array.isArray(value)) {
      return value;
    }
    if (!value || typeof value !== 'object') {
      return [];
    }

    const keys = Object.keys(value);
    if (keys.length === 0) {
      return [];
    }

    const lengths = keys
      .map((key) => (Array.isArray(value[key]) ? value[key].length : 0))
      .filter((len) => len > 0);
    const size = lengths.length > 0 ? Math.max(...lengths) : 0;
    if (size === 0) {
      return [];
    }

    return Array.from({ length: size }, (_, index) =>
      keys.reduce(
        (acc, key) => ({
          ...acc,
          [key]: Array.isArray(value[key]) ? value[key][index] : undefined,
        }),
        {},
      ),
    );
  };

  private readonly normalizeDocument = (document: any): Inspection => ({
    ...document,
    checklist: document?.checklist ?? {},
    axles: this.toEmbeddedArray(document?.axles),
    tires: this.toEmbeddedArray(document?.tires),
  });

  async create(data: Partial<Inspection>): Promise<Inspection> {
    const result = await this.repository.insertOne(data as any);
    const created = await this.findById(result.insertedId.toString());
    return created as Inspection;
  }

  async findAll(
    includeDeleted = false,
    filters?: InspectionFilters,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: Inspection[]; total: number }> {
    const baseWhere: Record<string, unknown> = {};
    if (!includeDeleted) {
      baseWhere.deletedAt = null;
    }
    if (filters?.inspection_number) {
      baseWhere.inspection_number = filters.inspection_number;
    }
    if (filters?.vehicle_id) {
      baseWhere.vehicle_id = filters.vehicle_id;
    }

    const total = await this.repository.countDocuments(baseWhere as any);

    let cursor = this.repository
      .createCursor(baseWhere as any)
      .sort({ inspection_date: -1 });

    if (pagination) {
      cursor = cursor.skip(pagination.skip).limit(pagination.take);
    }

    const documents = await cursor.toArray();

    return {
      data: documents.map(this.normalizeDocument),
      total,
    };
  }

  async findById(id: string): Promise<Inspection | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const document = await this.repository.createCursor({
      _id: new ObjectId(id),
    } as any).next();

    if (!document) {
      return null;
    }

    return this.normalizeDocument(document);
  }

  async updateById(
    id: string,
    data: Partial<Inspection>,
  ): Promise<Inspection | null> {
    const current = await this.findById(id);
    if (!current) {
      return null;
    }

    await this.repository.updateOne(
      { _id: new ObjectId(id) },
      { $set: data as any },
    );
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const current = await this.findById(id);
    if (!current || current.deletedAt) {
      return false;
    }

    await this.repository.updateOne(
      { _id: new ObjectId(id) },
      { $set: { deletedAt: new Date() } },
    );
    return true;
  }

  async existsByInspectionNumber(inspectionNumber: string): Promise<boolean> {
    const total = await this.repository.countDocuments({
      inspection_number: inspectionNumber,
    });
    return total > 0;
  }
}
