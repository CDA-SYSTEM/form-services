import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { TemplateRepository } from './repositories/template.repository';
import { TemplateTypeRepository } from './repositories/template-type.repository';
import { TemplateVariableRepository } from './repositories/template-variable.repository';
import { InvoiceTemplate } from '../../shared/entities/invoice-template.entity';
import { TemplateType } from '../../shared/entities/template-type.entity';
import { TemplateVariable } from '../../shared/entities/template-variable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceTemplate, TemplateType, TemplateVariable])],
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplateRepository, TemplateTypeRepository, TemplateVariableRepository],
  exports: [TemplatesService],
})
export class TemplatesModule {}
