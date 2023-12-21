import { Module } from '@nestjs/common';
import {MemberResolver} from './member.resolver';
import {MembersService} from "./member.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Member} from "../../../entity/entities/Member";
import {MemberChannel} from "../../../entity/entities/MemberChannel";
import {CampaignReview} from "../../../entity/entities/CampaignReview";
import {Config} from "../../../entity/entities/Config";
import {JwtService} from "@nestjs/jwt";
import {Partner} from "../../../entity/entities/Partner";
import {Madein20ModelService} from "../madein20_model/madein20_model.service";
import {Admin} from "../../../entity/entities/Admin";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";

@Module({
    imports: [TypeOrmModule.forFeature([Member, MemberChannel,
        CampaignReview, Config, Partner, Admin, Campaign, CampaignItem
    ])],
    providers: [MemberResolver,MembersService,JwtService, Madein20ModelService],
})
export class MemberModule {}
