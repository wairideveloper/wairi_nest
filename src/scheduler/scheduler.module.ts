import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Campaign} from "../../entity/entities/Campaign";
import {CampaignItem} from "../../entity/entities/CampaignItem";
import {CampaignSubmit} from "../../entity/entities/CampaignSubmit";
import {CampaignItemSchedule} from "../../entity/entities/CampaignItemSchedule";


@Module({
  imports: [TypeOrmModule.forFeature([ Campaign, CampaignItem, CampaignSubmit, CampaignItemSchedule])],
  controllers: [SchedulerController],
  providers: [SchedulerService]
})
export class SchedulerModule {}
