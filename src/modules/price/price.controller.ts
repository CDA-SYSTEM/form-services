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
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceResponseDto } from './dto/price-response.dto';
import { ListPricesQueryDto } from './dto/list-prices-query.dto';
import { PaginatedPriceResponseDto } from './dto/paginated-price-response.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { CreatePriceUseCase } from './use-cases/create-price.use-case';
import { FindAllPricesUseCase } from './use-cases/find-all-prices.use-case';
import { FindOnePriceUseCase } from './use-cases/find-one-price.use-case';
import { UpdatePriceUseCase } from './use-cases/update-price.use-case';
import { RemovePriceUseCase } from './use-cases/remove-price.use-case';

@ApiTags('prices')
@Controller('prices')
export class PriceController {
  constructor(
    private readonly createPriceUseCase: CreatePriceUseCase,
    private readonly findAllPricesUseCase: FindAllPricesUseCase,
    private readonly findOnePriceUseCase: FindOnePriceUseCase,
    private readonly updatePriceUseCase: UpdatePriceUseCase,
    private readonly removePriceUseCase: RemovePriceUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear un precio' })
  @ApiOkResponse({ type: PriceResponseDto })
  @Post()
  create = (@Body() dto: CreatePriceDto): Promise<PriceResponseDto> =>
    this.createPriceUseCase.execute(dto);

  @ApiOperation({ summary: 'Listar precios con filtros y paginacion' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: String })
  @ApiQuery({ name: 'vehicleType', required: false, type: String })
  @ApiQuery({ name: 'revisionType', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiOkResponse({ type: PaginatedPriceResponseDto })
  @Get()
  findAll = (
    @Query() query: ListPricesQueryDto,
  ): Promise<PaginatedPriceResponseDto> =>
    this.findAllPricesUseCase.execute(query);

  @ApiOperation({ summary: 'Obtener precio por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: PriceResponseDto })
  @Get(':id')
  findOne = (@Param('id') id: string): Promise<PriceResponseDto> =>
    this.findOnePriceUseCase.execute(id);

  @ApiOperation({ summary: 'Actualizar precio por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: PriceResponseDto })
  @Patch(':id')
  update = (
    @Param('id') id: string,
    @Body() dto: UpdatePriceDto,
  ): Promise<PriceResponseDto> => this.updatePriceUseCase.execute(id, dto);

  @ApiOperation({ summary: 'Eliminar (soft delete) precio por id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  @Delete(':id')
  remove = (@Param('id') id: string): Promise<{ deleted: boolean }> =>
    this.removePriceUseCase.execute(id);
}
