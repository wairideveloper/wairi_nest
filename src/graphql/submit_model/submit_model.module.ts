import { Module } from '@nestjs/common';
import { SubmitModelService } from './submit_model.service';
import { CampaignService } from '../../campaign/campaign.service';
import { SubmitModelResolver } from './submit_model.resolver';
import {JwtService} from "@nestjs/jwt";
import {TypeOrmModule} from "@nestjs/typeorm";
import {CampaignSubmit} from "../../../entity/entities/CampaignSubmit";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {CampaignImage} from "../../../entity/entities/CampaignImage";
import {CampaignReview} from "../../../entity/entities/CampaignReview";
import {Cate} from "../../../entity/entities/Cate";
import {CateArea} from "../../../entity/entities/CateArea";
import {Partner} from "../../../entity/entities/Partner";
import {CampaignRecent} from "../../../entity/entities/CampaignRecent";
import {CampaignItemSchedule} from "../../../entity/entities/CampaignItemSchedule";
import {CampaignFav} from "../../../entity/entities/CampaignFav";
import {Payment} from "../../../entity/entities/Payment";
import {Member} from "../../../entity/entities/Member";
import {Madein20ModelService} from "../madein20_model/madein20_model.service";
import {MembersService} from "../member_model/member.service";
import {Admin} from "../../../entity/entities/Admin";
import {MemberChannel} from "../../../entity/entities/MemberChannel";
import {Config} from "../../../entity/entities/Config";
import {ApiplexService} from "../apiplex/apiplex.service";
import {NotificationTalk} from "../../../entity/entities/NotificationTalk";
import {LogModelService} from "../log_model/log_model.service";

@Module({
    imports: [TypeOrmModule.forFeature([
            Campaign, CampaignItem, CampaignImage, CampaignReview, Cate, CateArea, Partner,
            CampaignRecent, CampaignItemSchedule, CampaignFav, CampaignSubmit, Payment, Member, Admin,
            MemberChannel,Config, NotificationTalk
        ]
    )],
  providers: [SubmitModelResolver, SubmitModelService, JwtService, CampaignService, Madein20ModelService, MembersService,
  ApiplexService, LogModelService]
})
export class SubmitModelModule {}
