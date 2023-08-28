import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import {MembersService} from "../../members/members.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Member} from "../../../entity/entities/Member";
import {JwtService} from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([Member])],
    providers: [MemberResolver,MembersService,JwtService],
})
export class MemberModule {}