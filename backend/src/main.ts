import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get('API_VERSION'),
    prefix: 'v',
  });

  const config = new DocumentBuilder()
    .setTitle(configService.get('APP_NAME'))
    .setDescription('Product API')
    .setVersion('1.0')
    .addTag('Products API')
    // .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(configService.get('SWAGGER_ROUTE'), app, document);

  const port = configService.get('PORT') || 3000;
  console.log(`product-and-pricing-api server is running on port ${port}`);
  await app.listen(port);
}

bootstrap();
