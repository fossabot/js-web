import { join } from 'path';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.use(cookieParser());
  app.setGlobalPrefix('/api/auth');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SEAC Auth API')
      .setDescription('Documentation for SEAC Auth API')
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey' }, 'auth_token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'SEAC Auth API',
    });
  }

  // Needed for some post redirection in auth.
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(parseInt(process.env.PORT || '3300', 10));
}
bootstrap();
