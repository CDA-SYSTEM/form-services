import { Injectable } from '@nestjs/common';
import { PriceResponseDto } from '../dto/price-response.dto';
import { PriceService } from '../price.service';

@Injectable()
export class FindOnePriceUseCase {
  constructor(private readonly priceService: PriceService) {}

  execute = (id: string): Promise<PriceResponseDto> =>
    this.priceService.findOne(id);
}
