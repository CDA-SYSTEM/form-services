import { Injectable } from '@nestjs/common';
import { UpdateChecklistIdDto } from '../dto/update-checklist-id.dto';
import { InspectionService } from '../inspection.service';

@Injectable()
export class UpdateChecklistIdUseCase {
  constructor(private readonly inspectionService: InspectionService) {}

  execute(
    id: string,
    dto: UpdateChecklistIdDto,
  ): Promise<{ success: boolean }> {
    return this.inspectionService.updateChecklistId(id, dto);
  }
}
