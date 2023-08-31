import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {CampaignItemSchedule} from "../../../entity/entities/CampaignItemSchedule";
import {CampaignSubmit} from "../../../entity/entities/CampaignSubmit";

@Injectable()
export class CampaignService {
    constructor(
        @InjectRepository(Campaign)
        private campaignRepository: Repository<Campaign>,
        @InjectRepository(CampaignItem)
        private campaignItemRepository: Repository<CampaignItem>,
        @InjectRepository(CampaignItemSchedule)
        private campaignItemScheduleRepository: Repository<CampaignItemSchedule>,
        @InjectRepository(CampaignSubmit)
        private campaignSubmitRepository: Repository<CampaignSubmit>,
    ) {
    }

    /*
        최신순: regdate
        인기순: submitCount
     */
    async getProducts(sort:string) {
        let campaign: any[];
        try {

            if(sort == 'recent'){
                campaign = await this.campaignRepository
                    .createQueryBuilder('campaign')
                    .select('*')
                    .where("campaign.status = 200")
                    .orderBy("regdate", 'DESC')
                    .orderBy('weight', 'DESC')
                    .limit(8)
                    .getRawMany()
            }else{
                let submitCount = this.campaignSubmitRepository
                    .createQueryBuilder()
                    .subQuery()
                    .select([
                        'campaignSubmit.campaignIdx as campaignIdx',
                        'COUNT(*) AS submitCount'
                    ])
                    .from(CampaignSubmit, 'campaignSubmit')
                    .where('campaignSubmit.status > 0')
                    .andWhere('campaignSubmit.status < 900')
                    .groupBy('campaignSubmit.campaignIdx')
                    .getQuery();

                campaign = await this.campaignRepository
                    .createQueryBuilder('campaign')
                    .select('*')
                    .leftJoin(submitCount, 'campaignSubmit', 'campaignSubmit.campaignIdx = campaign.idx')
                    .where("campaign.status = 200")
                    .orderBy("submitCount", 'DESC')
                    .orderBy('weight', 'DESC')
                    .limit(8)
                    .getRawMany()
            }

            const campaignItem = await this.campaignItemRepository
                .createQueryBuilder('campaignItem')
                .select('*')
                .getRawMany()
            const campaignItemSchedule = await this.campaignItemScheduleRepository
                .createQueryBuilder('campaignItemSchedule')
                .select('*')
                .getRawMany()

            let result = [];
            campaign.forEach((item, index) => {
                result.push({
                    ...item,
                    campaignItem: campaignItem.filter((campaignItemItem, campaignItemIndex) => {
                        return campaignItemItem.campaignIdx == item.idx
                    }).map((campaignItemItem, campaignItemIndex) => {
                        return {
                            ...campaignItemItem,
                            campaignItemSchedule: campaignItemSchedule.filter((campaignItemScheduleItem, campaignItemScheduleIndex) => {
                                return campaignItemScheduleItem.campaignItemIdx == campaignItemItem.idx
                            })
                        }
                    })
                })
            })
            return result;
        } catch (error) {
            throw error;
        }

    }
}