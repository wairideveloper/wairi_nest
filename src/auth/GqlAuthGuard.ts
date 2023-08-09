import {ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import process from "process";
import {Request} from "express";
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        // return ctx.getContext().req;
        const request = ctx.getContext().req;
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        // try {
        //     const payload =  this.jwtService.verifyAsync(token, {
        //         secret: process.env.JWT_SECRET,
        //     });
        //     request.user = payload;
        // } catch {
        //     throw new UnauthorizedException();
        // }
        return request;
    }
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}