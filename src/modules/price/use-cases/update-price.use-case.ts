import { Injectable } from '@nestjs/common';
import { PriceResponseDto } from '../dto/price-response.dto';
import { UpdatePriceDto } from '../dto/update-price.dto';
import { PriceService } from '../price.service';

@Injectable()
export class UpdatePriceUseCase {
  constructor(private readonly priceService: PriceService) {}

  execute = (id: string, dto: UpdatePriceDto): Promise<PriceResponseDto> =>
    this.priceService.update(id, dto);
}
