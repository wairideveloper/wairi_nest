import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";
import * as process from 'process';
export class JwtKakaoStrategy extends PassportStrategy(Strategy, "kakao") {
    constructor() {
        super({
            // clientID: '5e1360f4b54fed146fe2666df3a74b1a',
            clientID: process.env.KAKAO_CLIENT_ID,
            clientSecret: '',
            callbackURL: process.env.KAKAO_CALLBACK_URL,
            scope: ["account_email", "profile_nickname"],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        console.log('accessToken : '+accessToken)
        console.log('refreshToken : '+refreshToken)
        console.log(profile)
        console.log(profile._json.kakao_account.email)

        return {
            name: profile.displayName,
            email: profile._json.kakao_account.email,
            id: profile.id,
            profile: profile
        };
    }
}