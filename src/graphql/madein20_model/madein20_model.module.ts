import { Module } from '@nestjs/common';
import { Madein20ModelService } from './madein20_model.service';
import { Madein20ModelResolver } from './madein20_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Admin} from "../../../entity/entities/Admin";
import {Partner} from "../../../entity/entities/Partner";
import {Campaign} from "../../../entity/entities/Campaign";
import {Member} from "../../../entity/entities/Member";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {MemberChannel} from "../../../entity/entities/MemberChannel";

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Admin, Partner, Campaign, Member, CampaignItem, MemberChannel
      ]),
  ],
  providers: [Madein20ModelResolver, Madein20ModelService]
})
export class Madein20ModelModule {}
