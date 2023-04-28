import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MembersService } from '../members/members.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../../entity/entities/Member';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MembersService],
})
export class AuthModule {}
