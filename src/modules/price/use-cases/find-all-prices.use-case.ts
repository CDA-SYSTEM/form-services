import { Injectable } from '@nestjs/common';
import { ListPricesQueryDto } from '../dto/list-prices-query.dto';
import { PaginatedPriceResponseDto } from '../dto/paginated-price-response.dto';
import { PriceService } from '../price.service';

@Injectable()
export class FindAllPricesUseCase {
  constructor(private readonly priceService: PriceService) {}

  execute = (query: ListPricesQueryDto): Promise<PaginatedPriceResponseDto> =>
    this.priceService.findAll(query);
}
