import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { TemplateType } from '../../../shared/entities/template-type.entity';

@Injectable()
export class TemplateTypeRepository {
  constructor(
    @InjectRepository(TemplateType)
    private readonly repository: MongoRepository<TemplateType>,
  ) {}

  async create(data: Partial<TemplateType>): Promise<TemplateType> {
    const result = await this.repository.insertOne(data as any);
    const created = await this.findById(result.insertedId.toString());
    return created as TemplateType;
  }

  async findById(id: string): Promise<TemplateType | null> {
    if (!ObjectId.isValid(id)) return null;
    const document = await this.repository
      .createCursor({ _id: new ObjectId(id) } as any)
      .next();
    return (document as TemplateType) ?? null;
  }

  async findByCode(code: string): Promise<TemplateType | null> {
    const document = await this.repository
      .createCursor({ code } as any)
      .next();
    return (document as TemplateType) ?? null;
  }

  async findAll(): Promise<TemplateType[]> {
    const cursor = this.repository.createCursor({});
    return (await cursor.toArray()) as TemplateType[];
  }
}
