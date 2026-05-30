import { Injectable } from '@nestjs/common';
import { CreateStatusDto } from '../dto/create-status.dto';
import { StatusResponseDto } from '../dto/status-response.dto';
import { StatusService } from '../status.service';

@Injectable()
export class CreateStatusUseCase {
  constructor(private readonly statusService: StatusService) {}

  execute = (dto: CreateStatusDto): Promise<StatusResponseDto> =>
    this.statusService.create(dto);
}
