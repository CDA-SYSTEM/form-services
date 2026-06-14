import { Injectable } from '@nestjs/common';
import { ListStatusesQueryDto } from '../dto/list-statuses-query.dto';
import { PaginatedStatusResponseDto } from '../dto/paginated-status-response.dto';
import { StatusService } from '../status.service';

@Injectable()
export class FindAllStatusesUseCase {
  constructor(private readonly statusService: StatusService) {}

  execute = (
    query: ListStatusesQueryDto,
  ): Promise<PaginatedStatusResponseDto> => this.statusService.findAll(query);
}
