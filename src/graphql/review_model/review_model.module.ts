import { Module } from '@nestjs/common';
import { ReviewModelService } from './review_model.service';
import { ReviewModelResolver } from './review_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignReview} from "../../../entity/entities/CampaignReview";

@Module({
  imports: [TypeOrmModule.forFeature([Campaign,CampaignReview])],
  providers: [ReviewModelResolver, ReviewModelService]
})
export class ReviewModelModule {}
