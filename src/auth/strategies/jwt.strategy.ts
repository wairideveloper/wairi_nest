import {Module} from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as process from 'process';
import {ConfigService} from "@nestjs/config";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            //Request에서 JWT 토큰을 추출하는 방법을 설정 -> Authorization에서 Bearer Token에 JWT 토큰을 담아 전송해야한다.
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            //true로 설정하면 Passport에 토큰 검증을 위임하지 않고 직접 검증, false는 Passport에 검증 위임
            ignoreExpiration: true,
            //검증 비밀 값(유출 주위)
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    /**
     * @author Ryan
     * @description 클라이언트가 전송한 Jwt 토큰 정보
     *
     * @param payload 토큰 전송 내용
     */
    async validate(payload: any) {
        console.log('=========================!!!!!!!!!!!!!!!')
        console.log(payload)
        return { userId: payload.idx, username: payload.username };
    }
}