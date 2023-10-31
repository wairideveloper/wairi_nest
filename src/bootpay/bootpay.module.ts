import { Module } from '@nestjs/common';
import { BootpayService } from './bootpay.service';
import { BootpayController } from './bootpay.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Payment} from "../../entity/entities/Payment";
import {CampaignSubmit} from "../../entity/entities/CampaignSubmit";
import {SubmitModelService} from "../graphql/submit_model/submit_model.service";
import {CampaignItemSchedule} from "../../entity/entities/CampaignItemSchedule";

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Payment, CampaignSubmit, CampaignSubmit, CampaignItemSchedule
        ]),
  ],
  controllers: [BootpayController],
  providers: [BootpayService, SubmitModelService]
})
export class BootpayModule {}
