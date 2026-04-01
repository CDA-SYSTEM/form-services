import { Injectable } from '@nestjs/common';
import { CreateInspectionDto } from '../dto/create-inspection.dto';
import { InspectionResponseDto } from '../dto/inspection-response.dto';
import { InspectionService } from '../inspection.service';

@Injectable()
export class CreateInspectionUseCase {
  constructor(private readonly inspectionService: InspectionService) {}

  execute(dto: CreateInspectionDto): Promise<InspectionResponseDto> {
    return this.inspectionService.create(dto);
  }
}
