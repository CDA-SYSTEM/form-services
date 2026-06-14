import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { TemplateVariable } from '../../../shared/entities/template-variable.entity';

@Injectable()
export class TemplateVariableRepository {
  constructor(
    @InjectRepository(TemplateVariable)
    private readonly repository: MongoRepository<TemplateVariable>,
  ) {}

  async create(data: Partial<TemplateVariable>): Promise<TemplateVariable> {
    const result = await this.repository.insertOne(data as any);
    const created = await this.findById(result.insertedId.toString());
    return created as TemplateVariable;
  }

  async findById(id: string): Promise<TemplateVariable | null> {
    if (!ObjectId.isValid(id)) return null;
    const document = await this.repository
      .createCursor({ _id: new ObjectId(id) } as any)
      .next();
    return (document as TemplateVariable) ?? null;
  }

  async upsertByTag(
    tag: string,
    data: Partial<TemplateVariable>,
  ): Promise<TemplateVariable> {
    await this.repository.updateOne(
      { tag } as any,
      { $set: data },
      { upsert: true },
    );
    const cursor = this.repository.createCursor({ tag } as any);
    return (await cursor.next()) as TemplateVariable;
  }

  async findAll(category?: string): Promise<TemplateVariable[]> {
    const filter: any = {};
    if (category) {
      filter.category = category;
    }
    const cursor = this.repository.createCursor(filter);
    return (await cursor.toArray()) as TemplateVariable[];
  }
}
