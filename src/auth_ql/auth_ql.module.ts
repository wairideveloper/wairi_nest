import { Module } from '@nestjs/common';
import { AuthQlService } from './auth_ql.service';
import { AuthQlResolver } from './auth_ql.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Member} from "../../entity/entities/Member";
import {CampaignService} from "../campaign/campaign.service";
import {Campaign} from "../../entity/entities/Campaign";
import {CampaignItem} from "../../entity/entities/CampaignItem";
import {CampaignImage} from "../../entity/entities/CampaignImage";
import {Cate} from "../../entity/entities/Cate";
import {CateArea} from "../../entity/entities/CateArea";
import {Partner} from "../../entity/entities/Partner";
import {CampaignReview} from "../../entity/entities/CampaignReview";
import {CampaignRecent} from "../../entity/entities/CampaignRecent";

@Module({
  imports: [TypeOrmModule.forFeature([Member,Campaign,CampaignItem,CampaignImage,Cate,CateArea
      ,Partner,CampaignReview,CampaignRecent
  ])],
  providers: [AuthQlResolver, AuthQlService,CampaignService]
})
export class AuthQlModule {}
