import {Module} from '@nestjs/common';
import {CampaignService} from './campaign.service';
import {CampaignController} from './campaign.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Campaign} from '../../entity/entities/Campaign';
import {JwtService} from "@nestjs/jwt";
import {CampaignItem} from "../../entity/entities/CampaignItem";
import {CampaignImage} from "../../entity/entities/CampaignImage";
import {Cate} from "../../entity/entities/Cate";
import {CateArea} from "../../entity/entities/CateArea";
import {Partner} from "../../entity/entities/Partner";
import {CampaignReview} from "../../entity/entities/CampaignReview";
import {CampaignRecent} from "../../entity/entities/CampaignRecent";
import {CampaignItemSchedule} from "../../entity/entities/CampaignItemSchedule";
import {CampaignFav} from "../../entity/entities/CampaignFav";
import {CampaignSubmit} from "../../entity/entities/CampaignSubmit";

@Module({
    imports: [TypeOrmModule.forFeature([
            Campaign, CampaignItem, CampaignImage, CampaignReview, Cate, CateArea, Partner,
            CampaignRecent, CampaignItemSchedule, CampaignFav, CampaignSubmit
        ]
    )],
    controllers: [CampaignController],
    providers: [CampaignService, JwtService],
})
export class CampaignModule {
}
