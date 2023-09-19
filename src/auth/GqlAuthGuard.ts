import {ExecutionContext, HttpException, Injectable, UnauthorizedException} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import * as process from 'process';
import {Request} from "express";
import { JwtService } from '@nestjs/jwt';
import {ExecutionContextHost} from "@nestjs/core/helpers/execution-context-host";
import {Reflector} from "@nestjs/core";
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {

    constructor(private jwtService: JwtService) {
        super();
    }

    // getRequest(context: ExecutionContext) {
    //     const ctx = GqlExecutionContext.create(context);
    //     const req = ctx.getContext().req;
    //     req.body = ctx.getArgs();
    //     return req;
    // }
    async canActivate(context: ExecutionContext) {
        // await super.canActivate(context);
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;
        const token = this.extractTokenFromHeader(req);
        // console.log("-> token", token);
        req.user = this.validateToken(token);
        return true;
    }
    validateToken(token: string) {
        // console.log("-> token", token);
        const secretKey = process.env.JWT_SECRET;
        // console.log("-> secretKey", secretKey);

        try {
            const user = this.jwtService.verify(token, { secret: secretKey });
            // console.log("-> user", user);
            return user;
        } catch (e) {
            console.log("-> e", e);
            switch (e.message) {
                // 토큰에 대한 오류를 판단합니다.
                case 'invalid token':
                case 'NO_USER':
                    throw new HttpException('유효하지 않은 토큰입니다.', 401);

                case 'jwt expired':
                    throw new HttpException('토큰이 만료되었습니다.', 410);

                default:
                    throw new HttpException('서버 오류입니다.', 500);
            }
        }
    }

    // getRequest(context: ExecutionContext) {
    //     const ctx = GqlExecutionContext.create(context);
    //     // return ctx.getContext().req;
    //     const request = ctx.getContext().req;
    //     const token = this.extractTokenFromHeader(request);
    //
    //     // console.log(token)
    //     if (!token) {
    //         throw new UnauthorizedException();
    //     }
    //
    //
    //     // try {
    //     //     const payload =  this.jwtService.verifyAsync(token, {
    //     //         secret: process.env.JWT_SECRET,
    //     //     });
    //     //     request.user = payload;
    //     // } catch {
    //     //     throw new UnauthorizedException();
    //     // }
    //     return request;
    // }
    // canActivate(context: ExecutionContext) {
    //     const ctx = GqlExecutionContext.create(context);
    //     const request = ctx.getContext().req;
    //
    //     return super.canActivate(
    //         new ExecutionContextHost([request]),
    //     );
    // }
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}