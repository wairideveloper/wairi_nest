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

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Campaign,
          CampaignItem,
          CampaignItemSchedule,
          CampaignSubmit,
          Payment
      ]),
  ],
  providers: [PaymentModelResolver, PaymentModelService, JwtService, SubmitModelService]
})
export class PaymentModelModule {}
