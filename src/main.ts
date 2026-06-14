import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(
    '/docs',
    basicAuth({
      challenge: true,
      users: {
        [process.env.DOCS_USER ?? 'admin']:
          process.env.DOCS_PASSWORD ?? 'admin123',
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Form Service API')
    .setDescription('API para planilla de recepcion de vehiculos')
    .setVersion('1.0.0')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      },
      'api-key',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 7500);
  console.log(`Form service is running on port ${process.env.PORT ?? 7500}`);
  console.log(
    `docs available at http://localhost:${process.env.PORT ?? 7500}/docs`,
  );
}
bootstrap();
