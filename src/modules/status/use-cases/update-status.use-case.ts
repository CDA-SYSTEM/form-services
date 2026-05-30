import { Injectable } from '@nestjs/common';
import { StatusResponseDto } from '../dto/status-response.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { StatusService } from '../status.service';

@Injectable()
export class UpdateStatusUseCase {
  constructor(private readonly statusService: StatusService) {}

  execute = (
    id: string,
    dto: UpdateStatusDto,
  ): Promise<StatusResponseDto> =>
    this.statusService.update(id, dto);
}
