import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { StatusResponseDto } from './dto/status-response.dto';
import { ListStatusesQueryDto } from './dto/list-statuses-query.dto';
import { PaginatedStatusResponseDto } from './dto/paginated-status-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { StatusMapper } from './mappers/status.mapper';
import { StatusRepository } from './repositories/status.repository';

@Injectable()
export class StatusService {
  constructor(private readonly statusRepository: StatusRepository) {}

  create = async (dto: CreateStatusDto): Promise<StatusResponseDto> => {
    const payload = StatusMapper.toEntity(dto);
    const created = await this.statusRepository.create(payload);
    return StatusMapper.toResponseDto(created);
  };

  findAll = async (
    query: ListStatusesQueryDto = {},
  ): Promise<PaginatedStatusResponseDto> => {
    const { page, size, ...filters } = query;

    const pagination =
      page !== undefined && size !== undefined
        ? { skip: (page - 1) * size, take: size }
        : undefined;

    const result = await this.statusRepository.findAll(
      filters.includeDeleted === 'true',
      { code: filters.code?.trim() },
      pagination,
    );

    const data = result.data.map(StatusMapper.toResponseDto);

    return new PaginatedStatusResponseDto({
      data,
      total: result.total,
      page: page ?? 1,
      size: size ?? result.total,
    });
  };

  findOne = async (id: string): Promise<StatusResponseDto> => {
    const status = await this.statusRepository.findById(id);
    if (!status || status.deletedAt) {
      throw new NotFoundException(`Status with id "${id}" not found`);
    }
    return StatusMapper.toResponseDto(status);
  };

  update = async (
    id: string,
    dto: UpdateStatusDto,
  ): Promise<StatusResponseDto> => {
    const current = await this.statusRepository.findById(id);
    if (!current || current.deletedAt) {
      throw new NotFoundException(`Status with id "${id}" not found`);
    }

    const updated = await this.statusRepository.updateById(id, dto as any);
    if (!updated || updated.deletedAt) {
      throw new NotFoundException(`Status with id "${id}" not found`);
    }

    return StatusMapper.toResponseDto(updated);
  };

  remove = async (id: string): Promise<{ deleted: boolean }> => {
    const deleted = await this.statusRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Status with id "${id}" not found`);
    }
    return { deleted };
  };
}
