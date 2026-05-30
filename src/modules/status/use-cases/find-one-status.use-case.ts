import { Injectable } from '@nestjs/common';
import { StatusResponseDto } from '../dto/status-response.dto';
import { StatusService } from '../status.service';

@Injectable()
export class FindOneStatusUseCase {
  constructor(private readonly statusService: StatusService) {}

  execute = (id: string): Promise<StatusResponseDto> =>
    this.statusService.findOne(id);
}
