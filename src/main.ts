import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  //app.use(jwtMiddleware); 함수형 미들웨어만 사용가능
  await app.listen(3000);
}
bootstrap();
