import { Injectable } from '@nestjs/common';
import { ListInspectionsQueryDto } from '../dto/list-inspections-query.dto';
import { InspectionResponseDto } from '../dto/inspection-response.dto';
import { InspectionService } from '../inspection.service';

@Injectable()
export class FindAllInspectionsUseCase {
  constructor(private readonly inspectionService: InspectionService) {}

  execute(query: ListInspectionsQueryDto): Promise<InspectionResponseDto[]> {
    return this.inspectionService.findAll(query);
  }
}
