import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ApiEnvelopeInterceptor, ApiExceptionFilter } from './api.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  if (process.env.AUTH_SUCCESS_REDIRECT) {
    app.enableCors({ origin: new URL(process.env.AUTH_SUCCESS_REDIRECT).origin, credentials: true });
  }
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(app.get(ApiEnvelopeInterceptor));
  app.useGlobalFilters(new ApiExceptionFilter());
  const openApi = new DocumentBuilder()
    .setTitle('CoBusiness MVP API')
    .setDescription(
      'Versioned demo API. All identities, commercial data, and chain configuration are fictional. Payment and authorization invocations are unsigned.',
    )
    .setVersion('1.0.0')
    .addCookieAuth('__Host-cobusiness_session')
    .addTag('MVP v1')
    .addTag('health')
    .build();
  const document = SwaggerModule.createDocument(app, openApi);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/openapi.json',
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
