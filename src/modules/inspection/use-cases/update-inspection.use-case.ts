import { Injectable } from '@nestjs/common';
import { InspectionResponseDto } from '../dto/inspection-response.dto';
import { UpdateInspectionDto } from '../dto/update-inspection.dto';
import { InspectionService } from '../inspection.service';

@Injectable()
export class UpdateInspectionUseCase {
  constructor(private readonly inspectionService: InspectionService) {}

  execute(id: string, dto: UpdateInspectionDto): Promise<InspectionResponseDto> {
    return this.inspectionService.update(id, dto);
  }
}
