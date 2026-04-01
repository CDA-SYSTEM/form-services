import { Injectable } from '@nestjs/common';
import { InspectionService } from '../inspection.service';

@Injectable()
export class RemoveInspectionUseCase {
  constructor(private readonly inspectionService: InspectionService) {}

  execute(id: string): Promise<{ deleted: boolean }> {
    return this.inspectionService.remove(id);
  }
}
