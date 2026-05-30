import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStatusDto } from './dto/create-status.dto';
import { StatusResponseDto } from './dto/status-response.dto';
import { ListStatusesQueryDto } from './dto/list-statuses-query.dto';
import { PaginatedStatusResponseDto } from './dto/paginated-status-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateStatusUseCase } from './use-cases/create-status.use-case';
import { FindAllStatusesUseCase } from './use-cases/find-all-statuses.use-case';
import { FindOneStatusUseCase } from './use-cases/find-one-status.use-case';
import { UpdateStatusUseCase } from './use-cases/update-status.use-case';
import { RemoveStatusUseCase } from './use-cases/remove-status.use-case';

@ApiTags('statuses')
@Controller('statuses')
export class StatusController {
  constructor(
    private readonly createStatusUseCase: CreateStatusUseCase,
    private readonly findAllStatusesUseCase: FindAllStatusesUseCase,
    private readonly findOneStatusUseCase: FindOneStatusUseCase,
    private readonly updateStatusUseCase: UpdateStatusUseCase,
    private readonly removeStatusUseCase: RemoveStatusUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear un estado' })
  @ApiOkResponse({ type: StatusResponseDto })
  @Post()
  create = (@Body() dto: CreateStatusDto): Promise<StatusResponseDto> =>
    this.createStatusUseCase.execute(dto);

  @ApiOperation({ summary: 'Listar estados con filtros y paginacion' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: String })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiOkResponse({ type: PaginatedStatusResponseDto })
  @Get()
  findAll = (
    @Query() query: ListStatusesQueryDto,
  ): Promise<PaginatedStatusResponseDto> =>
    this.findAllStatusesUseCase.execute(query);

  @ApiOperation({ summary: 'Obtener estado por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: StatusResponseDto })
  @Get(':id')
  findOne = (@Param('id') id: string): Promise<StatusResponseDto> =>
    this.findOneStatusUseCase.execute(id);

  @ApiOperation({ summary: 'Actualizar estado por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: StatusResponseDto })
  @Patch(':id')
  update = (
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<StatusResponseDto> => this.updateStatusUseCase.execute(id, dto);

  @ApiOperation({ summary: 'Eliminar (soft delete) estado por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  @Delete(':id')
  remove = (@Param('id') id: string): Promise<{ deleted: boolean }> =>
    this.removeStatusUseCase.execute(id);
}
