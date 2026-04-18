import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { InspectionService } from '../../modules/inspection/inspection.service';
import { BrakeFluidSightGlass } from '../../shared/types/brake-fluid-sight-glass.enum';
import { CustomerType } from '../../shared/types/customer-type.enum';
import { RevisionType } from '../../shared/types/revision-type.enum';
import { FuelType } from '../../shared/types/fuel-type.enum';
import { ServiceType } from '../../shared/types/service-type.enum';
import { TernaryChoice } from '../../shared/types/ternary-choice.enum';
import { TirePosition } from '../../shared/types/tire-position.enum';
import { VehicleType } from '../../shared/types/vehicle-type.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const inspectionService = app.get(InspectionService);

  const current = await inspectionService.findAll();
  if (current.length > 0) {
    await app.close();
    return;
  }

  await inspectionService.create({
    mileage: 125000,
    client_id: '1234567890 - Carlos Perez',
    vehicle_id: 'ABC123',
    vehicle_type: VehicleType.LIVIANO,
    fuel_type: FuelType.DIESEL,
    service_type: ServiceType.PUBLICO,
    operator_id: '9876543210 - Laura Ruiz',
    responsible_id: '1122334455 - Andres Salazar',
    customer_id: 'CUST-001',
    customer_type: CustomerType.PROPIETARIO,
    revision_type: RevisionType.TECNICO_MECANICA,
    tinted_windows: TernaryChoice.NO,
    armored_vehicle: TernaryChoice.NO,
    brake_fluid_sight_glass: BrakeFluidSightGlass.BUEN_ESTADO,
    observations: 'Vehiculo en condiciones generales adecuadas.',
    signature_url: 'https://example.com/signatures/inspection-1.png',
    photo_reception_url: 'https://example.com/photos/inspection-1.jpg',
    checklist: {
      is_clean: true,
      hubcaps_removed: true,
      alarms_off: true,
      is_unloaded: true,
      public_service_seats: 0,
      seatbelts_visible: true,
    },
    axles: [
      { index: 1, axle_type: 'DELANTERO' },
      { index: 2, axle_type: 'TRASERO' },
    ],
    tires: [
      { position: TirePosition.FRONT_LEFT, code: 'AA001', tire_pressure: 32.0 },
      { position: TirePosition.FRONT_RIGHT, code: 'AA002', tire_pressure: 32.3 },
      { position: TirePosition.REAR_LEFT, code: 'AA003', tire_pressure: 30.8 },
      { position: TirePosition.REAR_RIGHT, code: 'AA004', tire_pressure: 30.6 },
    ],
  });

  await app.close();
}

void bootstrap();
