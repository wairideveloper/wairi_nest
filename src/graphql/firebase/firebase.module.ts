import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseResolver } from './firebase.resolver';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as process from 'process';
import * as admin from 'firebase-admin';
import {ServiceAccount} from "firebase-admin";

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const firebaseConfig = {
      // type: configService.get<string>('TYPE'),
      project_id: process.env.FIREBASE_PROJECT_ID,
      // private_key_id: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      // client_id: configService.get<string>('CLIENT_ID'),
      // auth_uri: configService.get<string>('AUTH_URI'),
      // token_uri: configService.get<string>('TOKEN_URI'),
      // auth_provider_x509_cert_url: configService.get<string>('AUTH_CERT_URL'),
      // client_x509_cert_url: configService.get<string>('CLIENT_CERT_URL'),
      // universe_domain: configService.get<string>('UNIVERSAL_DOMAIN'),
    } as admin.ServiceAccount;

    return admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  },
};

@Module({
  imports: [ConfigModule],
  providers: [FirebaseResolver, FirebaseService, firebaseProvider]
})
export class FirebaseModule {}
