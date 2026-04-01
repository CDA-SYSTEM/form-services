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
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { InspectionResponseDto } from './dto/inspection-response.dto';
import { ListInspectionsQueryDto } from './dto/list-inspections-query.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { CreateInspectionUseCase } from './use-cases/create-inspection.use-case';
import { FindAllInspectionsUseCase } from './use-cases/find-all-inspections.use-case';
import { FindOneInspectionUseCase } from './use-cases/find-one-inspection.use-case';
import { RemoveInspectionUseCase } from './use-cases/remove-inspection.use-case';
import { UpdateInspectionUseCase } from './use-cases/update-inspection.use-case';

@ApiTags('inspections')
@Controller('inspections')
export class InspectionController {
  constructor(
    private readonly createInspectionUseCase: CreateInspectionUseCase,
    private readonly findAllInspectionsUseCase: FindAllInspectionsUseCase,
    private readonly findOneInspectionUseCase: FindOneInspectionUseCase,
    private readonly updateInspectionUseCase: UpdateInspectionUseCase,
    private readonly removeInspectionUseCase: RemoveInspectionUseCase,
  ) {}

  @ApiOperation({
    summary: 'Crear una inspeccion',
    description:
      'Si se envia vehicle_type: MOTOCICLETA exige 2 llantas y solo checklist.is_clean obligatorio; VEHICULO_LIVIANO exige 4 llantas + checklist completo; VEHICULO_PESADO permite de 1 a 12 llantas + checklist completo.',
  })
  @ApiOkResponse({ type: InspectionResponseDto })
  @Post()
  create(@Body() dto: CreateInspectionDto): Promise<InspectionResponseDto> {
    return this.createInspectionUseCase.execute(dto);
  }

  @ApiOperation({ summary: 'Listar inspecciones con filtros opcionales' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: String })
  @ApiQuery({ name: 'inspection_number', required: false, type: String })
  @ApiQuery({ name: 'vehicle_id', required: false, type: String })
  @ApiOkResponse({ type: InspectionResponseDto, isArray: true })
  @Get()
  findAll(@Query() query: ListInspectionsQueryDto): Promise<InspectionResponseDto[]> {
    return this.findAllInspectionsUseCase.execute(query);
  }

  @ApiOperation({ summary: 'Obtener inspeccion por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: InspectionResponseDto })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<InspectionResponseDto> {
    return this.findOneInspectionUseCase.execute(id);
  }

  @ApiOperation({
    summary: 'Actualizar inspeccion por id',
    description:
      'Al actualizar vehicle_type/tires/checklist se valida: moto (2 llantas + limpieza), liviano (4 llantas + checklist completo), pesado (hasta 12 llantas + checklist completo).',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: InspectionResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInspectionDto,
  ): Promise<InspectionResponseDto> {
    return this.updateInspectionUseCase.execute(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar (soft delete) inspeccion por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    schema: {
      example: { deleted: true },
    },
  })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.removeInspectionUseCase.execute(id);
  }
}
