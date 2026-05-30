import { CreatePriceDto } from '../dto/create-price.dto';
import { PriceResponseDto } from '../dto/price-response.dto';
import { Price } from '../../../shared/entities/price.entity';

export class PriceMapper {
  static toEntity = (dto: CreatePriceDto): Partial<Price> => ({
    ...dto,
    deletedAt: null,
  });

  static toResponseDto = (entity: Price): PriceResponseDto => ({
    id: entity._id.toString(),
    vehicleType: entity.vehicleType,
    revisionType: entity.revisionType,
    amount: entity.amount,
    description: entity.description,
    isActive: entity.isActive,
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
  });
}
