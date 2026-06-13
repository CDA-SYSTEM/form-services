import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TemplateRepository } from './repositories/template.repository';
import { TemplateTypeRepository } from './repositories/template-type.repository';
import { TemplateVariableRepository } from './repositories/template-variable.repository';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateResponseDto } from './dto/template-response.dto';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly repository: TemplateRepository,
    private readonly typeRepository: TemplateTypeRepository,
    private readonly variableRepository: TemplateVariableRepository,
  ) {}

  async create(dto: CreateTemplateDto): Promise<TemplateResponseDto> {
    if (dto.isActive) {
      await this.repository.deactivateAllByType(dto.typeCode);
    }
    const created = await this.repository.create(dto);
    return this.mapToDto(created);
  }

  async findAll(typeCode?: string): Promise<TemplateResponseDto[]> {
    const templates = await this.repository.findAll(typeCode);
    return templates.map(t => this.mapToDto(t));
  }

  async findOne(id: string): Promise<TemplateResponseDto> {
    const template = await this.repository.findById(id);
    if (!template) throw new NotFoundException(`Template with ID ${id} not found`);
    return this.mapToDto(template);
  }

  async findActiveByType(typeCode: string): Promise<TemplateResponseDto> {
    const template = await this.repository.findActiveByType(typeCode);
    if (!template) throw new NotFoundException(`No active template found for type ${typeCode}`);
    return this.mapToDto(template);
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<TemplateResponseDto> {
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundException(`Template with ID ${id} not found`);

    if (dto.isActive && !current.isActive) {
      await this.repository.deactivateAllByType(dto.typeCode || current.typeCode);
    }

    const updated = await this.repository.updateById(id, dto);
    return this.mapToDto(updated!);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repository.deleteById(id);
    if (!deleted) throw new NotFoundException(`Template with ID ${id} not found`);
  }

  async activate(id: string): Promise<TemplateResponseDto> {
    const template = await this.repository.findById(id);
    if (!template) throw new NotFoundException(`Template with ID ${id} not found`);

    await this.repository.deactivateAllByType(template.typeCode);
    const updated = await this.repository.updateById(id, { isActive: true });
    return this.mapToDto(updated!);
  }

  // Meta-data methods
  async findAllTypes() {
    return this.typeRepository.findAll();
  }

  async findAllVariables(category?: string) {
    return this.variableRepository.findAll(category);
  }

  async createType(data: any) {
    return this.typeRepository.create(data);
  }

  async createVariable(data: any) {
    return this.variableRepository.create(data);
  }

  private mapToDto(entity: any): TemplateResponseDto {
    return {
      id: entity._id.toString(),
      name: entity.name,
      typeCode: entity.typeCode,
      body: entity.body,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
