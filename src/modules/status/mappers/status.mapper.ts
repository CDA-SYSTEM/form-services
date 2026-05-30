import { CreateStatusDto } from '../dto/create-status.dto';
import { StatusResponseDto } from '../dto/status-response.dto';
import { Status } from '../../../shared/entities/status.entity';

export class StatusMapper {
  static toEntity = (dto: CreateStatusDto): Partial<Status> => ({
    ...dto,
    deletedAt: null,
  });

  static toResponseDto = (entity: Status): StatusResponseDto => ({
    id: entity._id.toString(),
    code: entity.code,
    name: entity.name,
    description: entity.description,
    color: entity.color,
    order: entity.order,
    isActive: entity.isActive,
    deletedAt: entity.deletedAt ? entity.deletedAt.toISOString() : null,
  });
}
