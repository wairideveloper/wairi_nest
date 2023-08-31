import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {MembersService} from '../members/members.service';
import {AuthController} from './auth.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Member} from '../../entity/entities/Member';
import {MemberChannel} from "../../entity/entities/MemberChannel";
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {PassportModule} from "@nestjs/passport";
import {JwtKakaoStrategy} from "./strategies/kakao.strategy";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {NaverStrategy} from "./strategies/naver.strategy";
import {JwtGoogleStrategy} from "./strategies/google.strategy";

@Module({
    imports: [
        TypeOrmModule.forFeature([Member, MemberChannel]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    // expiresIn: configService.get('JWT_EXPIRATION_TIME'),
                    expiresIn: '30s',
                },
            }),
        }),
        PassportModule.register({defaultStrategy: 'jwt'}),
    ],
    controllers: [AuthController],
    providers: [AuthService, MembersService, JwtKakaoStrategy,
        JwtStrategy, NaverStrategy, JwtGoogleStrategy],
})
export class AuthModule {
}
