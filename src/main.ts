import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {HttpExceptionFilter} from "./util/HttpExceptionFilter";
import {winstonLogger} from "./util/winston.util";
import {ValidationPipe} from "@nestjs/common";
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import {GqlExceptionFilter} from "./util/GraphqlExceptionFilter";
import { ConfigService } from '@nestjs/config';
// Import firebase-admin
import * as admin from 'firebase-admin';
import { ServiceAccount } from "firebase-admin";
async function bootstrap() {
  const app = await NestFactory.create(AppModule,
      {
          logger: winstonLogger,

      });
  const configService: ConfigService = app.get(ConfigService);
    app.useGlobalPipes(new ValidationPipe());
  //예외 필터 연결
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new GqlExceptionFilter());
  //Global Middleware 설정 -> Cors 속성 활성화
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    optionsSuccessStatus: 200,
  });

  app.use(graphqlUploadExpress({maxFileSize:1000000, maxFiles: 5}))

  // // Set the config options
  // const adminConfig: ServiceAccount = {
  //   "projectId": configService.get<string>('FIREBASE_PROJECT_ID'),
  //   "privateKey": configService.get<string>('FIREBASE_PRIVATE_KEY')
  //       .replace(/\\n/g, '\n'),
  //   "clientEmail": configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  // };
  // // Initialize the firebase admin app
  // admin.initializeApp({
  //   credential: admin.credential.cert(adminConfig),
  //   databaseURL: "https://wairi-399502-default-rtdb.firebaseio.com/",
  // });

  app.enableCors();

  await app.listen(3000);
}
bootstrap().then(r => console.log("NestJS Server Start"));
