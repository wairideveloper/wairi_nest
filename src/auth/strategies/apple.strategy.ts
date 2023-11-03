import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from '@arendajaelu/nestjs-passport-apple';
import * as process from 'process';
const APPLE_STRATEGY_NAME = 'apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, APPLE_STRATEGY_NAME) {
    constructor() {
        super({
            clientID: process.env.APPLE_OAUTH_CLIENT_ID,
            teamID: process.env.APPLE_TEAMID,
            keyID: process.env.APPLE_KEYID,
            key: process.env.APPLE_KEY_CONTENTS,
            // OR
            keyFilePath: process.env.APPLE_KEYFILE_PATH,
            callbackURL: process.env.APPLE_OAUTH_CALLBACK_URL,
            scope: ['email', 'name'],
            passReqToCallback: false,
        });
    }

    async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
        return {
            emailAddress: profile.email,
            firstName: profile.name?.firstName || '',
            lastName: profile.name?.lastName || '',
        };
    }
}

@Injectable()
export class AppleOAuthGuard extends AuthGuard(APPLE_STRATEGY_NAME) {}
