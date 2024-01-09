import { Module } from '@nestjs/common';
import { PaymentModelService } from './payment_model.service';
import {SubmitModelService} from "../submit_model/submit_model.service";
import { PaymentModelResolver } from './payment_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CampaignSubmit} from "../../../entity/entities/CampaignSubmit";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {CampaignItemSchedule} from "../../../entity/entities/CampaignItemSchedule";
import {JwtService} from "@nestjs/jwt";
import {Payment} from "../../../entity/entities/Payment";
import {Member} from "../../../entity/entities/Member";
import {ApiplexService} from "../apiplex/apiplex.service";
import {NotificationTalk} from "../../../entity/entities/NotificationTalk";
import {Admin} from "../../../entity/entities/Admin";
import {Partner} from "../../../entity/entities/Partner";

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Campaign,
          CampaignItem,
          CampaignItemSchedule,
          CampaignSubmit,
          Payment,
          Member,
          NotificationTalk,
          Admin,
          Partner
      ]),
  ],
  providers: [PaymentModelResolver, PaymentModelService, JwtService, SubmitModelService,
  ApiplexService],
})
export class PaymentModelModule {}
