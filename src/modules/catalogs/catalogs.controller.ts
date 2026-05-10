import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehicleType } from '../../shared/types/vehicle-type.enum';
import { ServiceType } from '../../shared/types/service-type.enum';

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
}
