import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import {
  BaseResponseDto,
  PaginationParamsDto,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/central');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SEAC Central API')
      .setDescription('Documentation for SEAC Central API')
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey' }, 'auth_token')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [BaseResponseDto, PaginationParamsDto],
    });
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'SEAC Central API',
    });
  }

  await app.listen(parseInt(process.env.PORT || '4400', 10));
}
bootstrap();
