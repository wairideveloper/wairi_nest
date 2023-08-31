import { Module } from '@nestjs/common';
import {MemberResolver} from './member.resolver';
import {MembersService} from "./member.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Member} from "../../../entity/entities/Member";
import {MemberChannel} from "../../../entity/entities/MemberChannel";
import {CampaignReview} from "../../../entity/entities/CampaignReview";
import {Config} from "../../../entity/entities/Config";
import {JwtService} from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([Member, MemberChannel,
        CampaignReview, Config
    ])],
    providers: [MemberResolver,MembersService,JwtService],
})
export class MemberModule {}