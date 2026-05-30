import { Injectable } from '@nestjs/common';
import { UpdateInspectionStatusDto } from '../dto/update-inspection-status.dto';
import { InspectionService } from '../inspection.service';

@Injectable()
export class UpdateInspectionStatusUseCase {
  constructor(private readonly inspectionService: InspectionService) {}

  execute(id: string, dto: UpdateInspectionStatusDto): Promise<{ success: boolean }> {
    return this.inspectionService.updateInspectionStatus(id, dto);
  }
}
