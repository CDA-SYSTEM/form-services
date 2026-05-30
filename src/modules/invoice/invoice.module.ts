import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './repositories/invoice.repository';
import { Invoice } from '../../shared/entities/invoice.entity';
import { InspectionModule } from '../inspection/inspection.module';
import { CreateInvoiceUseCase } from './use-cases/create-invoice.use-case';
import { FindAllInvoicesUseCase } from './use-cases/find-all-invoices.use-case';
import { FindOneInvoiceUseCase } from './use-cases/find-one-invoice.use-case';
import { UpdateInvoiceUseCase } from './use-cases/update-invoice.use-case';
import { RemoveInvoiceUseCase } from './use-cases/remove-invoice.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice]), InspectionModule],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    InvoiceRepository,
    CreateInvoiceUseCase,
    FindAllInvoicesUseCase,
    FindOneInvoiceUseCase,
    UpdateInvoiceUseCase,
    RemoveInvoiceUseCase,
  ],
  exports: [InvoiceService, InvoiceRepository],
})
export class InvoiceModule {}
