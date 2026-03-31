import { Injectable } from '@nestjs/common';
import { InspectionResponseDto } from '../dto/inspection-response.dto';
import { InspectionService } from '../inspection.service';

@Injectable()
export class FindOneInspectionUseCase {
  constructor(private readonly inspectionService: InspectionService) {}

  execute(id: string): Promise<InspectionResponseDto> {
    return this.inspectionService.findOne(id);
  }
}
