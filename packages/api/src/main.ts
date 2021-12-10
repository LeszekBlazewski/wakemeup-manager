import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const appRef = { value: null };
const logLevels: LogLevel[] = ['error', 'warn', 'log', 'verbose'];
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: logLevels.slice(0, +process.env.LOG_VERBOSITY || 4),
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Lab 229 Cluster Manager')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  appRef.value = app;
  await app.listen(3000);
}

bootstrap();
