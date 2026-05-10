import { ApiProperty } from '@nestjs/swagger';
import { InspectionResponseDto } from './inspection-response.dto';

export class PaginatedInspectionResponseDto {
  @ApiProperty({
    type: InspectionResponseDto,
    isArray: true,
    description: 'Arreglo de inspecciones',
  })
  data: InspectionResponseDto[];

  @ApiProperty({ example: 100, description: 'Total de registros' })
  total: number;

  @ApiProperty({ example: 1, description: 'Pagina actual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Elementos por pagina' })
  size: number;

  @ApiProperty({ example: 10, description: 'Total de paginas' })
  totalPages: number;

  constructor(partial: Partial<PaginatedInspectionResponseDto>) {
    Object.assign(this, partial);
    if (this.total !== undefined && this.size !== undefined && this.size > 0) {
      this.totalPages = Math.ceil(this.total / this.size);
    }
  }
}
