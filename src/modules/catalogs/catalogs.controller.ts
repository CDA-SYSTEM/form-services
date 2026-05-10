import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehicleType } from '../../shared/types/vehicle-type.enum';
import { ServiceType } from '../../shared/types/service-type.enum';
import { FuelType } from '../../shared/types/fuel-type.enum';
import { TirePosition } from '../../shared/types/tire-position.enum';
import { TernaryChoice } from '../../shared/types/ternary-choice.enum';

@ApiTags('catalogs')
@Controller('catalogs')
export class CatalogsController {
  @Get('vehicle-types')
  @ApiOperation({ summary: 'Obtener tipos de vehiculo' })
  getVehicleTypes(): string[] {
    return Object.values(VehicleType);
  }

  @Get('service-types')
  @ApiOperation({ summary: 'Obtener tipos de servicio' })
  getServiceTypes(): string[] {
    return Object.values(ServiceType);
  }

  @Get('fuel-types')
  @ApiOperation({ summary: 'Obtener tipos de combustible' })
  getFuelTypes(): string[] {
    return Object.values(FuelType);
  }

  @Get('tire-positions')
  @ApiOperation({ summary: 'Obtener posiciones de llantas' })
  getTirePositions(): string[] {
    return Object.values(TirePosition);
  }

  @Get('ternary-choices')
  @ApiOperation({ summary: 'Obtener opciones ternarias (SI/NO/NO_APLICA)' })
  getTernaryChoices(): string[] {
    return Object.values(TernaryChoice);
  }
}
