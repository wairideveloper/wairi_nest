import { Module } from '@nestjs/common';
import { ReviewModelService } from './review_model.service';
import { ReviewModelResolver } from './review_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignReview} from "../../../entity/entities/CampaignReview";
import {JwtService} from "@nestjs/jwt";
import {CommonModelService} from "../common_model/common_model.service";
import {Config} from "../../../entity/entities/Config";

@Module({
  imports: [TypeOrmModule.forFeature([Campaign,CampaignReview,Config])],
  providers: [ReviewModelResolver, ReviewModelService, JwtService, CommonModelService]
})
export class ReviewModelModule {}
