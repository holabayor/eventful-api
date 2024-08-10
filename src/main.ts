import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';
import { CombinedLogger } from './common/logger/combined.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(CombinedLogger));
  // app.useGlobalInterceptors(new LoggingInterceptor());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // const config = new DocumentBuilder()
  //   .setTitle('Eventful API')
  //   .setDescription('The Eventful API description')
  //   .setVersion('1.0.0')
  //   .addBearerAuth()
  //   .build();
  const document = JSON.parse(readFileSync('docs/openapi.json', 'utf8'));
  // console.log('The document is ', document);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(3300);
}
bootstrap();
