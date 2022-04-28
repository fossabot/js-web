import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('/api/payment');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SEAC Payment API')
      .setDescription('Documentation for SEAC Payment API')
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey' }, 'auth_token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'SEAC Payment API',
    });
  }

  await app.listen(parseInt(process.env.PORT || '5500', 10));
}
bootstrap();
