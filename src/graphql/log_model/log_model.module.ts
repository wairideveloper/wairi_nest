import { Module } from '@nestjs/common';
import { LogModelService } from './log_model.service';
import { CampaignSubmitLog} from "../../../entity/entities/CampaignSubmitLog";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [
      TypeOrmModule.forFeature([
        CampaignSubmitLog
      ]),
    ],
  providers: [LogModelService]
})
export class LogModelModule {}
