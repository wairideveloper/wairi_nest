import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {HttpExceptionFilter} from "../src/util/HttpExceptionFilter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //예외 필터 연결
  app.useGlobalFilters(new HttpExceptionFilter());
console.log(__dirname)

  //Global Middleware 설정 -> Cors 속성 활성화
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    optionsSuccessStatus: 200,
  });

  await app.listen(3000);
}
bootstrap();
