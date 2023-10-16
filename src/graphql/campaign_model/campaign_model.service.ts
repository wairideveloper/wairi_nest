import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {CampaignItemSchedule} from "../../../entity/entities/CampaignItemSchedule";
import {CampaignSubmit} from "../../../entity/entities/CampaignSubmit";
import {CateArea} from "../../../entity/entities/CateArea";
import {Cate} from "../../../entity/entities/Cate";

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
        @InjectRepository(CateArea)
        private cateAreaRepository: Repository<CateArea>,
        @InjectRepository(Cate)
        private cateRepository: Repository<Cate>,

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
                    .leftJoin('campaign.campaignItem', 'campaignItem')
                    .leftJoin('campaignItem.campaignItemSchedule', 'campaignItemSchedule')
                    .leftJoin('campaign.partner', 'partner')
                    .select([
                        'campaign.idx as idx',
                        'campaign.name as name',
                        'campaign.status as status',
                        'campaign.regdate as regdate',
                        'campaign.weight as weight',
                        'campaign.cateIdx as cateIdx',
                        'campaign.cateAreaIdx as cateAreaIdx',
                        'IFNULL(min(campaignItem.priceOrig),0) as lowestPriceOrig',
                        'IFNULL(min(campaignItem.priceDeposit),0) as lowestPriceDeposit',
                        'IFNULL(min(campaignItemSchedule.priceDeposit), 0) as lowestSchedulePriceDeposit'
                    ])
                    // .where("campaign.status = 200")
                    // .andWhere("campaignItem.remove != 1")
                    // .orderBy("campaign.regdate", 'DESC')
                    // .orderBy('campaign.weight', 'DESC')
                    .where('campaign.remove = :remove', {remove: 0})
                    .andWhere('campaignItem.remove = :cr', {cr: 0})
                    .andWhere('campaign.status >= :t', {t: 200})
                    .andWhere('campaign.status <= :s', {s: 700})
                    .andWhere('partner.status = :status', {status: 1})
                    .orderBy('campaign.weight', 'DESC')
                    .addOrderBy('campaign.regdate', 'DESC')
                    .groupBy('campaign.idx')
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
                .where("campaignItem.remove != 1")
                .getRawMany()
            const campaignItemSchedule = await this.campaignItemScheduleRepository
                .createQueryBuilder('campaignItemSchedule')
                .select('*')
                .getRawMany()

            const cate = await this.cateRepository
                .createQueryBuilder('cate')
                .select('*')
                .getRawMany()

            const cateArea = await this.cateAreaRepository
                .createQueryBuilder('cateArea')
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

                                return campaignItemScheduleItem.itemIdx == campaignItemItem.idx
                            })
                        }
                    }),
                    category: cate.filter((cateItem, cateIndex) => {
                        return cateItem.idx == item.cateIdx
                    }).map((cateItem, cateIndex) => {
                      return {
                            ...cateItem,
                            cateArea: cateArea.filter((cateAreaItem, cateAreaIndex) => {
                                   return cateAreaItem.idx == item.cateAreaIdx
                            })
                      }
                    })
                })
            })
            console.log("=>(campaign_model.service.ts:115) result", result);
            return result;
        } catch (error) {
            throw error;
        }

    }
}
