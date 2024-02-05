import { Module } from '@nestjs/common';
import { ApiplexService } from './apiplex.service';
import { ApiplexResolver } from './apiplex.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {NotificationTalk} from "../../../entity/entities/NotificationTalk";
import {Admin} from "../../../entity/entities/Admin";
import {Partner} from "../../../entity/entities/Partner";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {Member} from "../../../entity/entities/Member";
import {MemberChannel} from "../../../entity/entities/MemberChannel";
import {MembersService} from "../member_model/member.service";
import {CampaignReview} from "../../../entity/entities/CampaignReview";
import {Config} from "../../../entity/entities/Config";

@Module({
  imports: [TypeOrmModule.forFeature([
      NotificationTalk, Admin, Partner, Campaign, CampaignItem, Member,
      MemberChannel,CampaignReview,Config
  ])],
  providers: [ApiplexResolver, ApiplexService, MembersService]
})
export class ApiplexModule {}
