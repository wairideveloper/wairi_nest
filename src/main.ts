import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {HttpExceptionFilter} from "../src/util/HttpExceptionFilter";
import {winstonLogger} from "./util/winston.util";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
      {
          logger: winstonLogger,
      });
    app.useGlobalPipes(new ValidationPipe());
  //예외 필터 연결
  app.useGlobalFilters(new HttpExceptionFilter());

  //Global Middleware 설정 -> Cors 속성 활성화
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    optionsSuccessStatus: 200,
  });

  await app.listen(3000);
}
bootstrap();
