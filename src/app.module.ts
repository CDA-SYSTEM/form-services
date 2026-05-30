import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { InspectionModule } from './modules/inspection/inspection.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { PriceModule } from './modules/price/price.module';
import { RabbitMQModule } from './modules/rabbitmq/rabbitmq.module';
import { StatusModule } from './modules/status/status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        PORT: Joi.number().default(7500),
        API_KEY: Joi.string().required(),
        SIGNATURE_BUCKET_NAME: Joi.string().optional(),
        RABBITMQ_URI: Joi.string().allow('').optional(),
        RABBITMQ_QUEUE_USER: Joi.string().allow('').optional(),
        RABBITMQ_PASSWORD: Joi.string().allow('').optional(),
        RABBITMQ_HOST: Joi.string().default('localhost'),
        RABBITMQ_PORT: Joi.number().default(5672),
        RABBITMQ_CLIENT_QUEUE: Joi.string().default('client-service-queue'),
        RABBITMQ_VEHICLE_QUEUE: Joi.string().default('vehicle-service-queue'),
        RABBITMQ_RPC_TIMEOUT_MS: Joi.number().default(8000),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.getOrThrow<string>('MONGO_URI'),
        useUnifiedTopology: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    CatalogsModule,
    RabbitMQModule,
    InspectionModule,
    StatusModule,
    PriceModule,
    InvoiceModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
