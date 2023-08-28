import {Args, Int, Query, Resolver} from "@nestjs/graphql";
import {AuthGqlService} from "./auth_gql.service";
import * as process from 'process';
import {JwtService} from "@nestjs/jwt";
@Resolver('Auth')
export class AuthResolver {
    constructor(private readonly authGqlService: AuthGqlService,
    private jwtService: JwtService
    ){
        console.log('AuthQlResolver')
    }

    @Query()
    async login(@Args('idx', {type: () => Int}) id: number) {

        try {
            const access_token = await this.jwtService.signAsync({ id }, {
                expiresIn: process.env.JWT_EXPIRATION_TIME,
                secret: process.env.JWT_SECRET
            });
            console.log("-> access_token", access_token);

            if (!access_token) {
                throw new Error("로그인 실패: 토큰 생성 실패");
            }

            return {
                token: access_token,
            };
        } catch (error) {
            throw new Error(`로그인 실패: ${error.message}`);
        }
    }


}