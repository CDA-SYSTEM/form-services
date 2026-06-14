import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { StatusService } from '../../modules/status/status.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const statusService = app.get(StatusService);

  const current = await statusService.findAll();
  if (current.data.length > 0) {
    await app.close();
    return;
  }

  const statuses = [
    {
      code: 'PENDING',
      name: 'Pendiente',
      color: '#F59E0B',
      order: 1,
      isActive: true,
    },
    {
      code: 'PAID',
      name: 'Pagado',
      color: '#10B981',
      order: 2,
      isActive: true,
    },
    {
      code: 'CANCELLED',
      name: 'Anulado',
      color: '#EF4444',
      order: 3,
      isActive: true,
    },
    {
      code: 'REFUNDED',
      name: 'Reembolsado',
      color: '#6366F1',
      order: 4,
      isActive: true,
    },
  ];

  for (const status of statuses) {
    await statusService.create(status);
  }

  console.log(`Seeded ${statuses.length} statuses`);
  await app.close();
}

void bootstrap();
