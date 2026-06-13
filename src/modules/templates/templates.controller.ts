import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateResponseDto } from './dto/template-response.dto';
import { TemplateType } from '../../shared/entities/invoice-template.entity';

@ApiTags('invoice-templates')
@Controller('invoice-templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva plantilla' })
  @ApiResponse({ status: 201, type: TemplateResponseDto })
  create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las plantillas' })
  @ApiResponse({ status: 200, type: [TemplateResponseDto] })
  findAll(@Query('typeCode') typeCode?: string) {
    return this.templatesService.findAll(typeCode);
  }

  @Get('active/:typeCode')
  @ApiOperation({ summary: 'Obtener la plantilla activa por tipo' })
  @ApiResponse({ status: 200, type: TemplateResponseDto })
  findActive(@Param('typeCode') typeCode: string) {
    return this.templatesService.findActiveByType(typeCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una plantilla por ID' })
  @ApiResponse({ status: 200, type: TemplateResponseDto })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una plantilla' })
  @ApiResponse({ status: 200, type: TemplateResponseDto })
  update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar una plantilla (desactiva las demás del mismo tipo)' })
  @ApiResponse({ status: 200, type: TemplateResponseDto })
  activate(@Param('id') id: string) {
    return this.templatesService.activate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una plantilla' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  // Meta-data endpoints
  @Get('meta/types')
  @ApiOperation({ summary: 'Listar tipos de plantillas disponibles' })
  findAllTypes() {
    return this.templatesService.findAllTypes();
  }

  @Get('meta/variables')
  @ApiOperation({ summary: 'Listar variables disponibles para las plantillas' })
  findAllVariables(@Query('category') category?: string) {
    return this.templatesService.findAllVariables(category);
  }
}
