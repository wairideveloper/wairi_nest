import { Module } from '@nestjs/common';
import { PaymentModelService } from './payment_model.service';
import { PaymentModelResolver } from './payment_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CampaignSubmit} from "../../../entity/entities/CampaignSubmit";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {CampaignItemSchedule} from "../../../entity/entities/CampaignItemSchedule";

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Campaign,
          CampaignItem,
          CampaignItemSchedule,
          CampaignSubmit
      ]),
  ],
  providers: [PaymentModelResolver, PaymentModelService]
})
export class PaymentModelModule {}
