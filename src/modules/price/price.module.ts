import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';
import { PriceRepository } from './repositories/price.repository';
import { Price } from '../../shared/entities/price.entity';
import { CreatePriceUseCase } from './use-cases/create-price.use-case';
import { FindAllPricesUseCase } from './use-cases/find-all-prices.use-case';
import { FindOnePriceUseCase } from './use-cases/find-one-price.use-case';
import { UpdatePriceUseCase } from './use-cases/update-price.use-case';
import { RemovePriceUseCase } from './use-cases/remove-price.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Price])],
  controllers: [PriceController],
  providers: [
    PriceService,
    PriceRepository,
    CreatePriceUseCase,
    FindAllPricesUseCase,
    FindOnePriceUseCase,
    UpdatePriceUseCase,
    RemovePriceUseCase,
  ],
  exports: [PriceService, PriceRepository],
})
export class PriceModule {}
