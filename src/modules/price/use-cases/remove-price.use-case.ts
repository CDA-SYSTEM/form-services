import { Injectable } from '@nestjs/common';
import { PriceService } from '../price.service';

@Injectable()
export class RemovePriceUseCase {
  constructor(private readonly priceService: PriceService) {}

  execute = (id: string): Promise<{ deleted: boolean }> =>
    this.priceService.remove(id);
}
