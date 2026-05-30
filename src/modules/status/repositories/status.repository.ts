import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { Status } from '../../../shared/entities/status.entity';

type StatusFilters = {
  code?: string;
};

@Injectable()
export class StatusRepository {
  constructor(
    @InjectRepository(Status)
    private readonly repository: MongoRepository<Status>,
  ) {}

  create = async (data: Partial<Status>): Promise<Status> => {
    const result = await this.repository.insertOne(data as any);
    const created = await this.findById(result.insertedId.toString());
    return created as Status;
  };

  findAll = async (
    includeDeleted = false,
    filters?: StatusFilters,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: Status[]; total: number }> => {
    const baseWhere: Record<string, unknown> = {};
    if (!includeDeleted) {
      baseWhere.deletedAt = null;
    }
    if (filters?.code) {
      baseWhere.code = filters.code;
    }

    const total = await this.repository.countDocuments(baseWhere as any);

    let cursor = this.repository
      .createCursor(baseWhere as any)
      .sort({ order: 1 });

    if (pagination) {
      cursor = cursor.skip(pagination.skip).limit(pagination.take);
    }

    const documents = await cursor.toArray();

    return { data: documents as Status[], total };
  };

  findById = async (id: string): Promise<Status | null> => {
    if (!ObjectId.isValid(id)) return null;
    const document = await this.repository
      .createCursor({ _id: new ObjectId(id) } as any)
      .next();
    return (document as Status) ?? null;
  };

  updateById = async (
    id: string,
    data: Partial<Status>,
  ): Promise<Status | null> => {
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
