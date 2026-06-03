import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspectionController } from './inspection.controller';
import { InspectionService } from './inspection.service';
import { InspectionRepository } from './repositories/inspection.repository';
import { Inspection } from '../../shared/entities/inspection.entity';
import { StatusModule } from '../status/status.module';
import { CreateInspectionUseCase } from './use-cases/create-inspection.use-case';
import { FindAllInspectionsUseCase } from './use-cases/find-all-inspections.use-case';
import { FindOneInspectionUseCase } from './use-cases/find-one-inspection.use-case';
import { RemoveInspectionUseCase } from './use-cases/remove-inspection.use-case';
import { UpdateChecklistIdUseCase } from './use-cases/update-checklist-id.use-case';
import { UpdateInspectionUseCase } from './use-cases/update-inspection.use-case';
import { UpdateInspectionStatusUseCase } from './use-cases/update-inspection-status.use-case';
import { GetInspectionStatsUseCase } from './use-cases/get-inspection-stats.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Inspection]), StatusModule],
  controllers: [InspectionController],
  providers: [
    InspectionService,
    InspectionRepository,
    CreateInspectionUseCase,
    FindAllInspectionsUseCase,
    FindOneInspectionUseCase,
    UpdateInspectionUseCase,
    UpdateChecklistIdUseCase,
    UpdateInspectionStatusUseCase,
    GetInspectionStatsUseCase,
    RemoveInspectionUseCase,
  ],
  exports: [InspectionService, InspectionRepository],
})
export class InspectionModule {}
