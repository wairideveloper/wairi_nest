import {HttpException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository, SelectQueryBuilder} from "typeorm";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {CampaignItemSchedule} from "../../../entity/entities/CampaignItemSchedule";
import {CampaignSubmit} from "../../../entity/entities/CampaignSubmit";
import {CateArea} from "../../../entity/entities/CateArea";
import {Cate} from "../../../entity/entities/Cate";
import {bufferToString} from "../../util/common";

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
                        'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
                        '(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1) as image2',
                    ])
                    .where('campaign.remove = :remove', {remove: 0})
                    .andWhere('campaignItem.remove = :cr', {cr: 0})
                    .andWhere('campaign.status = 200')
                    // .andWhere('campaign.status >= :t', {t: 200})
                    // .andWhere('campaign.status <= :s', {s: 700})
                    .andWhere('partner.status = :status', {status: 1})
                    .orderBy('campaign.weight', 'DESC')
                    .addOrderBy('campaign.regdate', 'DESC')
                    .groupBy('campaign.idx')
                    .limit(8)
                    .getRawMany()
            }else if(sort == 'popular'){
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
                    .select([
                        'campaign.idx as idx',
                        'campaign.name as name',
                        'campaign.status as status',
                        'campaign.regdate as regdate',
                        'campaign.weight as weight',
                        'campaign.cateIdx as cateIdx',
                        'campaign.cateAreaIdx as cateAreaIdx',
                        'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
                    ])
                    .leftJoin(submitCount, 'campaignSubmit', 'campaignSubmit.campaignIdx = campaign.idx')
                    .leftJoin('campaign.campaignItem', 'campaignItem')
                    .leftJoin('campaignItem.campaignItemSchedule', 'campaignItemSchedule')
                    .leftJoin('campaign.partner', 'partner')
                    .where('campaign.remove = :remove', {remove: 0})
                    .andWhere('campaignItem.remove = :cr', {cr: 0})
                    .andWhere('campaign.status = 200')
                    .andWhere('partner.status = :status', {status: 1})
                    .andWhere('campaignItem.endDate > UNIX_TIMESTAMP(NOW())')
                    // .orderBy("submitCount", 'DESC')
                    // .addOrderBy('weight', 'DESC')
                    .orderBy("weight", 'DESC')
                    .addOrderBy('regdate', 'DESC')
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
                    .where('campaignSubmit.status >= -1 ')
                    .andWhere('campaignSubmit.status <= 950')
                    .andWhere('campaignSubmit.regdate > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MONTH))')
                    .groupBy('campaignSubmit.campaignIdx')
                    .getQuery();

                let recentSubmitCount = this.campaignSubmitRepository
                    .createQueryBuilder()
                    .subQuery()
                    .select([
                        'campaignSubmit.campaignIdx as campaignIdx',
                        'COUNT(*) AS submitCount'
                    ])
                    .from(CampaignSubmit, 'campaignSubmit')
                    // .where('campaignSubmit.status >= 400')
                    .where('campaignSubmit.status BETWEEN 200 AND 700')
                    .andWhere('(campaignSubmit.statusDate900 = 0 OR campaignSubmit.statusDate900 IS NULL)')
                    .andWhere('campaignSubmit.regdate > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MONTH))')
                    .groupBy('campaignSubmit.campaignIdx')
                    .getQuery();

                let recentSubmitCountTotal = this.campaignSubmitRepository
                    .createQueryBuilder()
                    .subQuery()
                    .select([
                        'campaignSubmit.campaignIdx as campaignIdx',
                        'COUNT(*) AS submitCount'
                    ])
                    .from(CampaignSubmit, 'campaignSubmit')
                    .andWhere('campaignSubmit.regdate > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MONTH))')
                    .groupBy('campaignSubmit.campaignIdx')
                    .getQuery();

                campaign = await this.campaignRepository
                    .createQueryBuilder('campaign')
                    .select([
                        'campaign.idx as idx',
                        'campaign.name as name',
                        'campaign.status as status',
                        'campaign.regdate as regdate',
                        'campaign.weight as weight',
                        'campaign.cateIdx as cateIdx',
                        'campaign.cateAreaIdx as cateAreaIdx',
                        'ROUND((recentSubmitCount.submitCount / recentSubmitCountTotal.submitCount) * 100) AS approvalRate',
                        'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
                    ])
                    .leftJoin(submitCount, 'campaignSubmit', 'campaignSubmit.campaignIdx = campaign.idx')
                    .leftJoin(recentSubmitCount, 'recentSubmitCount', 'recentSubmitCount.campaignIdx = campaign.idx')
                    .leftJoin(recentSubmitCountTotal, 'recentSubmitCountTotal', 'recentSubmitCountTotal.campaignIdx = campaign.idx')
                    .leftJoin('campaign.campaignItem', 'campaignItem')
                    .leftJoin('campaignItem.campaignItemSchedule', 'campaignItemSchedule')
                    .leftJoin('campaign.partner', 'partner')
                    .where('campaign.remove = :remove', {remove: 0})
                    .andWhere('campaignItem.remove = :cr', {cr: 0})
                    .andWhere('campaign.status = 200')
                    .andWhere('partner.status = :status', {status: 1})
                    .andWhere('campaignItem.endDate > UNIX_TIMESTAMP(NOW())')
                    // .orderBy("approvalRate", 'DESC')
                    // .addOrderBy('weight', 'DESC')
                    .orderBy("approvalRate", 'DESC')
                    .addOrderBy("weight", 'DESC')
                    .addOrderBy('regdate', 'DESC')
                    .groupBy('campaign.idx')
                    .limit(1000)
                    .getRawMany()
            }

            let campaignItem = await this.campaignItemRepository
                .createQueryBuilder('campaignItem')
                .select('*')
                .where("campaignItem.remove != 1")
                .getRawMany()

            let campaignItemLowestPrice = await this.campaignRepository
                .createQueryBuilder('c')
                .select('c.idx', 'campaignIdx')
                .addSelect('c.name', 'campaignName')
                .addSelect(
                    (subQuery) =>
                        subQuery
                            .select('priceOrig')
                            .from('campaignItem', 'ci')
                            .where('ci.campaignIdx = c.idx')
                            .andWhere('ci.remove = 0')
                            .orderBy('priceOrig', 'ASC')
                            .limit(1),
                    'lowestPrice'
                )
                .addSelect(
                    (subQuery) =>
                        subQuery
                            .select('dc11')
                            .from('campaignItem', 'ci')
                            .where('ci.campaignIdx = c.idx')
                            .andWhere('ci.remove = 0')
                            .orderBy('dc11', 'ASC')
                            .limit(1),
                    'dc11'
                )
                .where('c.status = 200')
                // .where('c.status >= :t', {t: 200})
                // .andWhere('c.status <= :s', {s: 700})
                .andWhere('c.remove = 0')
                .orderBy('c.weight', 'DESC')
                .addOrderBy('c.regdate', 'DESC')
                .getRawMany();

            let campaignItemSchedule = await this.campaignItemScheduleRepository
                .createQueryBuilder('campaignItemSchedule')
                .select('*')
                .getRawMany()


            let cate = await this.cateRepository
                .createQueryBuilder('cate')
                .select('*')
                .getRawMany()

            let cateArea = await this.cateAreaRepository
                .createQueryBuilder('cateArea')
                .select('*')
                .getRawMany()

            if(campaign){
                campaign = bufferToString(campaign)
                campaignItem = bufferToString(campaignItem)
                campaignItemSchedule = bufferToString(campaignItemSchedule)
                cate = bufferToString(cate)
                cateArea = bufferToString(cateArea)
                campaignItemLowestPrice = bufferToString(campaignItemLowestPrice)
            }


            let result = [];
            campaign.forEach((item, index) => {
                campaignItemLowestPrice.forEach((campaignItemLowestPriceItem, campaignItemLowestPriceIndex) => {
                    if(item.idx == campaignItemLowestPriceItem.campaignIdx){
                        item.lowestPriceOrig = campaignItemLowestPriceItem.lowestPrice;
                        item.discountPercentage = campaignItemLowestPriceItem.dc11;
                        item.discountPrice = Math.round(item.lowestPriceOrig * item.discountPercentage / 100);
                    }
                })
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
            return result;
        } catch (error) {
            console.log("=>(campaign_model.service.ts:196) error", error);
            throw new HttpException(error.message, error.status);
        }
    }
}
