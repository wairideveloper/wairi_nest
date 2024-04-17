import { Module } from '@nestjs/common';
import { ApiplexService } from './apiplex.service';
import { ApiplexController } from './apiplex.controller';
import {Admin} from "../../entity/entities/Admin";
import {Partner} from "../../entity/entities/Partner";
import {Campaign} from "../../entity/entities/Campaign";
import {CampaignItem} from "../../entity/entities/CampaignItem";
import {Member} from "../../entity/entities/Member";
import {MemberChannel} from "../../entity/entities/MemberChannel";
import {NotificationTalk} from "../../entity/entities/NotificationTalk";
import {TypeOrmModule} from "@nestjs/typeorm";
@Module({
  imports: [TypeOrmModule.forFeature([Admin, Partner, Campaign, CampaignItem, Member, MemberChannel, NotificationTalk])],
  controllers: [ApiplexController],
  providers: [ApiplexService]
})
export class ApiplexModule {}
