import { Injectable } from '@nestjs/common';
import { StatusService } from '../status.service';

@Injectable()
export class RemoveStatusUseCase {
  constructor(private readonly statusService: StatusService) {}

  execute = (id: string): Promise<{ deleted: boolean }> =>
    this.statusService.remove(id);
}
