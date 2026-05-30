import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceResponseDto } from './dto/price-response.dto';
import { ListPricesQueryDto } from './dto/list-prices-query.dto';
import { PaginatedPriceResponseDto } from './dto/paginated-price-response.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { PriceMapper } from './mappers/price.mapper';
import { PriceRepository } from './repositories/price.repository';

@Injectable()
export class PriceService {
  constructor(private readonly priceRepository: PriceRepository) {}

  create = async (dto: CreatePriceDto): Promise<PriceResponseDto> => {
    const payload = PriceMapper.toEntity(dto);
    const created = await this.priceRepository.create(payload);
    return PriceMapper.toResponseDto(created);
  };

  findAll = async (
    query: ListPricesQueryDto = {},
  ): Promise<PaginatedPriceResponseDto> => {
    const { page, size, ...filters } = query;

    const pagination =
      page !== undefined && size !== undefined
        ? { skip: (page - 1) * size, take: size }
        : undefined;

    const result = await this.priceRepository.findAll(
      filters.includeDeleted === 'true',
      {
        vehicleType: filters.vehicleType?.trim() as any,
        revisionType: filters.revisionType?.trim() as any,
      },
      pagination,
    );

    const data = result.data.map(PriceMapper.toResponseDto);

    return new PaginatedPriceResponseDto({
      data,
      total: result.total,
      page: page ?? 1,
      size: size ?? result.total,
    });
  };

  findOne = async (id: string): Promise<PriceResponseDto> => {
    const price = await this.priceRepository.findById(id);
    if (!price || price.deletedAt) {
      throw new NotFoundException(`Price with id "${id}" not found`);
    }
    return PriceMapper.toResponseDto(price);
  };

  update = async (
    id: string,
    dto: UpdatePriceDto,
  ): Promise<PriceResponseDto> => {
    const current = await this.priceRepository.findById(id);
    if (!current || current.deletedAt) {
      throw new NotFoundException(`Price with id "${id}" not found`);
    }

    const updated = await this.priceRepository.updateById(id, dto as any);
    if (!updated || updated.deletedAt) {
      throw new NotFoundException(`Price with id "${id}" not found`);
    }

    return PriceMapper.toResponseDto(updated);
  };

  remove = async (id: string): Promise<{ deleted: boolean }> => {
    const deleted = await this.priceRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Price with id "${id}" not found`);
    }
    return { deleted };
  };
}
