import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Campaign} from "../../entity/entities/Campaign";
import {CampaignReview} from "../../entity/entities/CampaignReview";
import {Member} from "../../entity/entities/Member";
import {CampaignItem} from "../../entity/entities/CampaignItem";
@Module({
  imports: [TypeOrmModule.forFeature([Campaign, CampaignReview, Member, CampaignItem])],
  controllers: [ReviewController],
  providers: [ReviewService]
})
export class ReviewModule {}
