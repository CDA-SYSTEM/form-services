import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { Price } from '../../../shared/entities/price.entity';

type PriceFilters = {
  vehicleType?: string;
  revisionType?: string;
};

@Injectable()
export class PriceRepository {
  constructor(
    @InjectRepository(Price)
    private readonly repository: MongoRepository<Price>,
  ) {}

  create = async (data: Partial<Price>): Promise<Price> => {
    const result = await this.repository.insertOne(data as any);
    const created = await this.findById(result.insertedId.toString());
    return created as Price;
  };

  findAll = async (
    includeDeleted = false,
    filters?: PriceFilters,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: Price[]; total: number }> => {
    const baseWhere: Record<string, unknown> = {};
    if (!includeDeleted) {
      baseWhere.deletedAt = null;
    }
    if (filters?.vehicleType) {
      baseWhere.vehicleType = filters.vehicleType;
    }
    if (filters?.revisionType) {
      baseWhere.revisionType = filters.revisionType;
    }

    const total = await this.repository.countDocuments(baseWhere as any);

    let cursor = this.repository
      .createCursor(baseWhere as any)
      .sort({ vehicleType: 1, revisionType: 1 });

    if (pagination) {
      cursor = cursor.skip(pagination.skip).limit(pagination.take);
    }

    const documents = await cursor.toArray();

    return { data: documents as Price[], total };
  };

  findById = async (id: string): Promise<Price | null> => {
    if (!ObjectId.isValid(id)) return null;
    const document = await this.repository
      .createCursor({ _id: new ObjectId(id) } as any)
      .next();
    return (document as Price) ?? null;
  };

  updateById = async (
    id: string,
    data: Partial<Price>,
  ): Promise<Price | null> => {
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
}
