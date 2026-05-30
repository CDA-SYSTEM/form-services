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
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { ListInvoicesQueryDto } from './dto/list-invoices-query.dto';
import { PaginatedInvoiceResponseDto } from './dto/paginated-invoice-response.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateInvoiceUseCase } from './use-cases/create-invoice.use-case';
import { FindAllInvoicesUseCase } from './use-cases/find-all-invoices.use-case';
import { FindOneInvoiceUseCase } from './use-cases/find-one-invoice.use-case';
import { UpdateInvoiceUseCase } from './use-cases/update-invoice.use-case';
import { RemoveInvoiceUseCase } from './use-cases/remove-invoice.use-case';

@ApiTags('invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
    private readonly findAllInvoicesUseCase: FindAllInvoicesUseCase,
    private readonly findOneInvoiceUseCase: FindOneInvoiceUseCase,
    private readonly updateInvoiceUseCase: UpdateInvoiceUseCase,
    private readonly removeInvoiceUseCase: RemoveInvoiceUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear una factura' })
  @ApiOkResponse({ type: InvoiceResponseDto })
  @Post()
  create(@Body() dto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    return this.createInvoiceUseCase.execute(dto);
  }

  @ApiOperation({
    summary: 'Listar facturas con filtros opcionales y paginacion',
  })
  @ApiQuery({ name: 'includeDeleted', required: false, type: String })
  @ApiQuery({ name: 'invoice_number', required: false, type: String })
  @ApiQuery({ name: 'statusId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiOkResponse({ type: PaginatedInvoiceResponseDto })
  @Get()
  findAll(
    @Query() query: ListInvoicesQueryDto,
  ): Promise<PaginatedInvoiceResponseDto> {
    return this.findAllInvoicesUseCase.execute(query);
  }

  @ApiOperation({ summary: 'Obtener factura por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: InvoiceResponseDto })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.findOneInvoiceUseCase.execute(id);
  }

  @ApiOperation({ summary: 'Actualizar factura por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: InvoiceResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.updateInvoiceUseCase.execute(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar (soft delete) factura por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.removeInvoiceUseCase.execute(id);
  }
}
