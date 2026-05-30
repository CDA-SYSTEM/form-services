import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { StatusRepository } from './repositories/status.repository';
import { Status } from '../../shared/entities/status.entity';
import { CreateStatusUseCase } from './use-cases/create-status.use-case';
import { FindAllStatusesUseCase } from './use-cases/find-all-statuses.use-case';
import { FindOneStatusUseCase } from './use-cases/find-one-status.use-case';
import { UpdateStatusUseCase } from './use-cases/update-status.use-case';
import { RemoveStatusUseCase } from './use-cases/remove-status.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Status])],
  controllers: [StatusController],
  providers: [
    StatusService,
    StatusRepository,
    CreateStatusUseCase,
    FindAllStatusesUseCase,
    FindOneStatusUseCase,
    UpdateStatusUseCase,
    RemoveStatusUseCase,
  ],
  exports: [StatusService, StatusRepository],
})
export class StatusModule {}
