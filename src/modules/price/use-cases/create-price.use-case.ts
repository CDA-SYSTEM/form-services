import { Injectable } from '@nestjs/common';
import { CreatePriceDto } from '../dto/create-price.dto';
import { PriceResponseDto } from '../dto/price-response.dto';
import { PriceService } from '../price.service';

@Injectable()
export class CreatePriceUseCase {
  constructor(private readonly priceService: PriceService) {}

  execute = (dto: CreatePriceDto): Promise<PriceResponseDto> =>
    this.priceService.create(dto);
}
