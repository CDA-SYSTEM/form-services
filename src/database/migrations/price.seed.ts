import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { PriceService } from '../../modules/price/price.service';
import { VehicleType } from '../../shared/types/vehicle-type.enum';
import { RevisionType } from '../../shared/types/revision-type.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const priceService = app.get(PriceService);

  const current = await priceService.findAll();
  if (current.data.length > 0) {
    await app.close();
    return;
  }

  const prices = [
    { vehicleType: VehicleType.MOTOCICLETA_2_TIEMPOS, revisionType: RevisionType.TECNICO_MECANICA, amount: 80000, description: 'Revision tecnico-mecanica moto 2 tiempos', isActive: true },
    { vehicleType: VehicleType.MOTOCICLETA_2_TIEMPOS, revisionType: RevisionType.PREVENTIVA, amount: 60000, description: 'Revision preventiva moto 2 tiempos', isActive: true },
    { vehicleType: VehicleType.MOTOCICLETA_4_TIEMPOS, revisionType: RevisionType.TECNICO_MECANICA, amount: 90000, description: 'Revision tecnico-mecanica moto 4 tiempos', isActive: true },
    { vehicleType: VehicleType.MOTOCICLETA_4_TIEMPOS, revisionType: RevisionType.PREVENTIVA, amount: 70000, description: 'Revision preventiva moto 4 tiempos', isActive: true },
    { vehicleType: VehicleType.LIVIANO, revisionType: RevisionType.TECNICO_MECANICA, amount: 150000, description: 'Revision tecnico-mecanica vehiculo liviano', isActive: true },
    { vehicleType: VehicleType.LIVIANO, revisionType: RevisionType.PREVENTIVA, amount: 120000, description: 'Revision preventiva vehiculo liviano', isActive: true },
    { vehicleType: VehicleType.PESADO, revisionType: RevisionType.TECNICO_MECANICA, amount: 250000, description: 'Revision tecnico-mecanica vehiculo pesado', isActive: true },
    { vehicleType: VehicleType.PESADO, revisionType: RevisionType.PREVENTIVA, amount: 200000, description: 'Revision preventiva vehiculo pesado', isActive: true },
  ];

  for (const price of prices) {
    await priceService.create(price);
  }

  console.log(`Seeded ${prices.length} prices`);
  await app.close();
}

void bootstrap();
