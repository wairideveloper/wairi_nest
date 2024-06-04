import {HttpException, Injectable, NotFoundException} from '@nestjs/common';
import {Campaign} from "../../entity/entities/Campaign";
import {CampaignItem} from "../../entity/entities/CampaignItem";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository, SelectQueryBuilder} from "typeorm";
import {Pagination} from '../paginate'
import {Cate} from "../../entity/entities/Cate";
import {CateArea} from "../../entity/entities/CateArea";
import {Partner} from "../../entity/entities/Partner";
import {CampaignImage} from "../../entity/entities/CampaignImage";
import {CampaignReview} from "../../entity/entities/CampaignReview";
import {CampaignRecent} from "../../entity/entities/CampaignRecent";
import {CampaignItemSchedule} from "../../entity/entities/CampaignItemSchedule";
import {CampaignSubmit} from "../../entity/entities/CampaignSubmit";
import {CampaignFav} from "../../entity/entities/CampaignFav";
import {
    bufferToString,
    FROM_UNIXDATE,
    FROM_UNIXTIME,
    getUnixTimeStamp,
    getUnixTimeStampByYmd,
    getYmd
} from "../util/common"
import * as moment from 'moment';

@Injectable()
export class CampaignService {
    private discountRate: number;
    private additionalDiscountRate: number;

    constructor(
        @InjectRepository(Campaign)
        private campaignRepository: Repository<Campaign>,
        @InjectRepository(CampaignItem)
        private campaignItemRepository: Repository<CampaignItem>,
        @InjectRepository(CampaignImage)
        private campaignImageRepository: Repository<CampaignImage>,
        @InjectRepository(Cate)
        private campaignCateRepository: Repository<Cate>,
        @InjectRepository(CateArea)
        private campaignCateAreaRepository: Repository<CateArea>,
        @InjectRepository(Partner)
        private campaignPartnerRepository: Repository<Partner>,
        @InjectRepository(CampaignReview)
        private campaignReviewRepository: Repository<CampaignReview>,
        @InjectRepository(CampaignRecent)
        private campaignRecentRepository: Repository<CampaignRecent>,
        @InjectRepository(CampaignItemSchedule)
        private campaignItemScheduleRepository: Repository<CampaignItemSchedule>,
        @InjectRepository(CampaignFav)
        private campaignFavRepository: Repository<CampaignFav>,
        @InjectRepository(CampaignSubmit)
        private campaignSubmit: Repository<CampaignSubmit>,
    ) {
        //할인율 기본값
        this.discountRate = 0;

        //추가할인율 기본값
        this.additionalDiscountRate = 0;
    }

    async search(keyword: string, take: number = 10, page: number = 1) {
        // const {take, page} = {take: 10, page: 1};
        let query = this.campaignRepository.createQueryBuilder('campaign');
        query.leftJoin('campaign.campaignItem', 'campaignItem')
        query.leftJoin('campaign.campaignImage', 'campaignImage')
        query.leftJoin('campaign.cate', 'cate')
        query.leftJoin('campaign.cateArea', 'cateArea')
        query.leftJoin('campaign.partner', 'partner')
        query.select([
            'campaign.idx as idx',
            'campaign.name as name',
            'campaign.weight as weight',
            'campaign.status as status',
            'campaign.approvalMethod as approvalMethod',
            'campaign.grade as grade',
            // case when campaignItem.priceDeposit > 0 then campaignItem.priceDeposit else ROUND(CAST(campaignItem.priceOrig * campaignItem.dc11 / 100 AS UNSIGNED), -2) end as lowestPriceDeposit,
            // 'min(campaignItem.priceOrig) as lowestPriceOrig',
            // 'case when min(campaignItem.priceDeposit) > 0 then campaignItem.priceDeposit else campaignItem.priceOrig end as lowestPriceOrig',
            'min(campaignItem.calcType1) as lowestPriceCalcType1',
            'min(campaignItem.calcType2) as lowestPriceCalcType2',
            'min(campaignItem.sellType) as lowestPriceSellType',
            'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
            'cate.name as cateName',
            'cate.idx as cateIdx',
            'cateArea.name as cateAreaName',
            'partner.corpName as partnerName',
        ])
        if (process.env.PORT == '3000' || process.env.PORT == '4000') {
            console.log("=>(campaign_model.service.ts:57) process.env.PORT", process.env.PORT);
            query.addSelect(
                (subQuery) =>
                    subQuery
                        .select('aws_url')
                        .from('campaignImage', 'ci')
                        .where('ci.campaignIdx = campaign.idx')
                        .orderBy('ordering', 'ASC')
                        .limit(1),
                'image'
            )
        }
        query.addSelect(
            (subQuery) =>
                subQuery
                    .select('priceOrig')
                    .from('campaignItem', 'ci')
                    .where('ci.campaignIdx = campaign.idx')
                    .andWhere('ci.remove = 0')
                    .orderBy('priceOrig', 'ASC')
                    .limit(1),
            'lowestPriceOrig'
        )
        query.addSelect(
            (subQuery) =>
                subQuery
                    .select('dc11')
                    .from('campaignItem', 'ci')
                    .where('ci.campaignIdx = campaign.idx')
                    .andWhere('ci.remove = 0')
                    .orderBy('dc11', 'ASC')
                    .limit(1),
            'discountPercentage'
        )
        // .where('(campaign.status = 200 AND campaignItem.memberTarget = 1 AND campaign.remove = 0 AND campaign.name like :campaignKeyword) OR (campaign.status = 200  AND campaignItem.memberTarget = 1 AND campaign.remove = 0 AND campaignItem.name like :itemKeyword)', {
        query.where('(campaignItem.memberTarget = 1 AND campaign.remove = 0 AND campaign.name like :campaignKeyword) OR ( campaignItem.memberTarget = 1 AND campaign.remove = 0 AND campaignItem.name like :itemKeyword)', {
            // status: 200,
            // remove: 0,
            campaignKeyword: '%' + keyword + '%',
            itemKeyword: '%' + keyword + '%',
        })
        query.orderBy('campaign.idx', 'DESC')
        query.addOrderBy('campaign.weight', 'DESC')
        query.groupBy('campaign.idx')
        query.offset(take * (page - 1))
        query.limit(take)
        let data = await query.getRawMany();
        const campaignItemLowestPrice = await this.getCampaignLowestPrice();

        data = bufferToString(data);
        let result = [];
        data.forEach((item, index) => {
            item.discountPrice = Math.round(item.lowestPriceOrig * item.discountPercentage / 100);
            result.push(item);
        })
        // let result = [];

        // data.forEach((item) => {
        //     campaignItemLowestPrice.forEach((item2) => {
        //         if (item.idx == item2.campaignIdx) {
        //             item.lowestPriceOrig = item2.lowestPrice;
        //             item.discountPercentage = item2.dc11;
        //             item.discountPrice = Math.round(item.lowestPriceOrig * item.discountPercentage / 100);
        //             result.push(item);
        //         }
        //     })
        // });

        const total = await this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.campaignItem', 'campaignItem')
            // .where('campaign.remove = :remove', {remove: 0})
            // .andWhere('campaign.name like :keyword', {keyword: '%' + keyword + '%'})
            // .orWhere('campaignItem.name like :keyword', {keyword: '%' + keyword + '%'})
            // .where('(campaign.status = :status AND campaignItem.memberTarget = :memberTarget AND campaign.remove = :remove AND campaign.name like :campaignKeyword) OR (campaign.status = :status AND campaignItem.memberTarget = :memberTarget AND campaign.remove = :remove AND campaignItem.name like :itemKeyword)', {
            .where('(campaignItem.memberTarget = :memberTarget AND campaign.remove = :remove AND campaign.name like :campaignKeyword) OR (campaignItem.memberTarget = :memberTarget AND campaign.remove = :remove AND campaignItem.name like :itemKeyword)', {
                // status: 200,
                memberTarget: 1,
                remove: 0,
                campaignKeyword: '%' + keyword + '%',
                itemRemove: 0,
                itemKeyword: '%' + keyword + '%',
            })
            .getCount()

        let totalPage = Math.ceil(total / take);
        if (page > totalPage) {
            throw new NotFoundException();
        }
        const currentPage = page;

        return new Pagination({
            data,
            total,
            totalPage,
            currentPage
        });
    }

    async getCampaigns(take, page, cate, cateArea){

        const query = await this.campaignRepository.createQueryBuilder('campaign');
        query.leftJoin('cate', 'cate', 'cate.idx = campaign.cateIdx')
        query.leftJoin('campaign.cateArea', 'cateArea', 'cateArea.idx = campaign.cateAreaIdx')
        query.leftJoin('campaign.partner', 'partner', 'partner.idx = campaign.partnerIdx')
        query.leftJoin(
                subQuery => {
                    return subQuery
                        .select('ci.campaignIdx', 'campaignIdx')
                        .addSelect('ci.file_name', 'file_name')
                        .addSelect('ci.aws_url', 'aws_url')
                        .from(CampaignImage, 'ci')
                        .where('ci.ordering = 1')
                },
                'ci',
                'ci.campaignIdx = campaign.idx'
            )
        query.leftJoin(
                subQuery => {
                    return subQuery
                        .select('ci2.campaignIdx', 'campaignIdx')
                        .addSelect('MIN(ci2.priceOrig)', 'priceOrig')
                        .addSelect('MIN(ci2.dc11)', 'dc11')
                        .addSelect('ci2.memberTarget', 'memberTarget')
                        .from(CampaignItem, 'ci2')
                        .where('ci2.remove = 0')
                        .groupBy('ci2.campaignIdx')
                },
                'ci2',
                'ci2.campaignIdx = campaign.idx'
            )
        query.select([
            'campaign.idx as idx',
            'campaign.name as name',
            'campaign.weight as weight',
            'campaign.regdate as regdate',
            'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
            'cate.name as cateName',
            'cate.idx as cateIdx',
            'cateArea.name as cateAreaName',
            'cateArea.idx as cateAreaIdx',
            'campaign.status as status',
            'campaign.approvalMethod as approvalMethod',
            'campaign.grade as grade',
            'campaign.approvalRate as approvalRate',
            'ci2.memberTarget as memberTarget',
        ])
        query.addSelect(
            (subQuery) =>
                subQuery
                    .select('priceOrig')
                    .from('campaignItem', 'ci')
                    .where('ci.campaignIdx = campaign.idx')
                    .andWhere('ci.remove = 0')
                    .orderBy('priceOrig', 'ASC')
                    .limit(1),
            'lowestPriceOrig'
        )
        query.addSelect(
            (subQuery) =>
                subQuery
                    .select('dc11')
                    .from('campaignItem', 'ci')
                    .where('ci.campaignIdx = campaign.idx')
                    .andWhere('ci.remove = 0')
                    .orderBy('dc11', 'ASC')
                    .limit(1),
            'discountPercentage'
        )
        if (process.env.PORT == '3000' || process.env.PORT == '4000') {
            console.log("=>(campaign_model.service.ts:57) process.env.PORT", process.env.PORT);
            query.addSelect(
                (subQuery) =>
                    subQuery
                        .select('aws_url')
                        .from('campaignImage', 'ci')
                        .where('ci.campaignIdx = campaign.idx')
                        .orderBy('ordering', 'ASC')
                        .limit(1),
                'image'
            )
        }
        query.where('campaign.remove = 0')
        query.andWhere('campaign.status BETWEEN 200 AND 700')
        query.andWhere('ci2.memberTarget = 1')
        query.andWhere('partner.status = 1')
        query.orderBy('campaign.weight', 'DESC')
        query.addOrderBy('campaign.regdate', 'DESC')
        query.limit(1000)
        let data = await query.getRawMany();
        data = bufferToString(data);

        let result = [];
        data.forEach((item, index) => {
            item.discountPrice = Math.round(item.lowestPriceOrig * item.discountPercentage / 100);
            result.push(item);
        })

        let total = await query.getCount();
        let totalPage = Math.ceil(total / take);
        if (page > totalPage) {
            throw new NotFoundException();
        }

        // console.log("=>(campaign.service.ts:233) data", data);
        const currentPage = page;
        return new Pagination({
            data,
            total,
            totalPage,
            currentPage
        });
    }

    async mainList(take, page, cate, cateArea, sort) {
        let query: SelectQueryBuilder<Campaign>
        // let submitCount = this.campaignSubmit
        //     .createQueryBuilder()
        //     .subQuery()
        //     .select([
        //         'campaignSubmit.campaignIdx as campaignIdx',
        //         'COUNT(*) AS submitCount'
        //     ])
        //     .from(CampaignSubmit, 'campaignSubmit')
        //     .where('campaignSubmit.status >= -1 ')
        //     .andWhere('campaignSubmit.status <= 950')
        //     .andWhere('campaignSubmit.regdate > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MONTH))')
        //     .groupBy('campaignSubmit.campaignIdx')
        //     .getQuery();

        //최근 3개월 승인률 % 계산
        // let recentSubmitCount = this.campaignSubmit
        //     .createQueryBuilder()
        //     .subQuery()
        //     .select([
        //         'campaignSubmit.campaignIdx as campaignIdx',
        //         'COUNT(*) AS submitCount'
        //     ])
        //     .from(CampaignSubmit, 'campaignSubmit')
        //
        //     //(200 <= status <= 700 and status paymentIdx > 0) and (statusDate900 = 0 or statusDate900 is null)
        //     .where('campaignSubmit.status BETWEEN 200 AND 700')
        //     .andWhere('(campaignSubmit.statusDate900 = 0 OR campaignSubmit.statusDate900 IS NULL)')
        //     .andWhere('campaignSubmit.regdate > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MONTH))')
        //     .groupBy('campaignSubmit.campaignIdx')
        //     .getQuery();

        // let recentSubmitCountTotal = this.campaignSubmit
        //     .createQueryBuilder()
        //     .subQuery()
        //     .select([
        //         'campaignSubmit.campaignIdx as campaignIdx',
        //         'COUNT(*) AS submitCount'
        //     ])
        //     .from(CampaignSubmit, 'campaignSubmit')
        //     .andWhere('campaignSubmit.regdate > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MONTH))')
        //     .groupBy('campaignSubmit.campaignIdx')
        //     .getQuery();

        query = this.campaignRepository.createQueryBuilder('campaign');
        // .leftJoin(submitCount, 'campaignSubmit', 'campaignSubmit.campaignIdx = campaign.idx')
        // .leftJoin(recentSubmitCount, 'recentSubmitCount', 'recentSubmitCount.campaignIdx = campaign.idx')
        // .leftJoin(recentSubmitCountTotal, 'recentSubmitCountTotal', 'recentSubmitCountTotal.campaignIdx = campaign.idx')
        query.leftJoin('campaign.campaignItem', 'campaignItem')
        query.leftJoin('campaign.campaignImage', 'campaignImage')
        query.leftJoin('campaignItem.campaignItemSchedule', 'campaignItemSchedule')
        query.leftJoin('campaign.cate', 'cate')
        query.leftJoin('campaign.cateArea', 'cateArea')
        query.leftJoin('campaign.partner', 'partner')
        query.select([
            // 'campaignSubmit.submitCount',
            // % 계산
            // 'ROUND((recentSubmitCount.submitCount / recentSubmitCountTotal.submitCount) * 100) AS approvalRate',
            'campaign.idx as idx',
            'campaign.name as name',
            'campaign.weight as weight',
            'campaign.regdate as regdate',
            'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
            'cate.name as cateName',
            'cate.idx as cateIdx',
            'cateArea.name as cateAreaName',
            'cateArea.idx as cateAreaIdx',
            'campaign.status as status',
            'campaign.approvalMethod as approvalMethod',
            'campaign.grade as grade',
            'campaign.approvalRate as approvalRate',
        ])
        if (process.env.PORT == '3000' || process.env.PORT == '4000') {
            console.log("=>(campaign_model.service.ts:57) process.env.PORT", process.env.PORT);
            query.addSelect(
                (subQuery) =>
                    subQuery
                        .select('aws_url')
                        .from('campaignImage', 'ci')
                        .where('ci.campaignIdx = campaign.idx')
                        .orderBy('ordering', 'ASC')
                        .limit(1),
                'image'
            )
        }
        query.addSelect(
            (subQuery) =>
                subQuery
                    .select('priceOrig')
                    .from('campaignItem', 'ci')
                    .where('ci.campaignIdx = campaign.idx')
                    .andWhere('ci.remove = 0')
                    .orderBy('priceOrig', 'ASC')
                    .limit(1),
            'lowestPriceOrig'
        )
        query.addSelect(
            (subQuery) =>
                subQuery
                    .select('dc11')
                    .from('campaignItem', 'ci')
                    .where('ci.campaignIdx = campaign.idx')
                    .andWhere('ci.remove = 0')
                    .orderBy('dc11', 'ASC')
                    .limit(1),
            'discountPercentage'
        )
        query.where('campaign.remove = :remove', {remove: 0})
        query.andWhere('campaign.status >= :t', {t: 200})
        query.andWhere('campaign.status <= :s', {s: 700})
        query.andWhere('campaignItem.memberTarget = :mt', {mt: 1})
        query.andWhere('partner.status = :status', {status: 1})
        // .orderBy('submitCount', 'DESC')
        // .addOrderBy('campaign.weight', 'DESC')
        query.orderBy("weight", 'DESC')
        query.addOrderBy('regdate', 'DESC')
        query.groupBy('campaign.idx')
        query.offset(take * (page - 1))
        query.limit(take)

        if (cate) {
            query.andWhere('campaign.cateIdx = :cate', {cate: cate})
        }
        if (cateArea) {
            query.andWhere('campaign.cateAreaIdx = :cateArea', {cateArea: cateArea})
        }

        let data = await query.getRawMany();
        data = bufferToString(data);

        const campaignItemLowestPrice = await this.getCampaignLowestPrice();

        let result = [];
        data.forEach((item, index) => {
            item.discountPrice = Math.round(item.lowestPriceOrig * item.discountPercentage / 100);
            result.push(item);
        })
        // data.forEach((item) => {
        //     item.regdate = moment.unix(item.regdate).format('YYYY-MM-DD HH:mm:ss');
        //     campaignItemLowestPrice.forEach((item2) => {
        //         if (item.idx == item2.campaignIdx) {
        //             item.lowestPriceOrig = item2.lowestPrice;
        //             item.discountPercentage = item2.dc11;
        //             item.discountPrice = Math.round(item.lowestPriceOrig * item.discountPercentage / 100);
        //             result.push(item);
        //         }
        //     })
        // });

        const totalQuery = this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.campaignItem', 'campaignItem')
            .leftJoin('campaign.partner', 'partner')
            .where('campaign.remove = :remove', {remove: 0})
            // .andWhere('campaignItem.remove = :remove', {remove: 0})
            .andWhere('campaign.status >= :t', {t: 200})
            .andWhere('campaign.status <= :s', {s: 700})
            .andWhere('partner.status = :status', {status: 1})
        if (cate) {
            totalQuery.andWhere('campaign.cateIdx = :cate', {cate: cate})
        }
        if (cateArea) {
            totalQuery.andWhere('campaign.cateAreaIdx = :cateArea', {cateArea: cateArea})
        }
        const total = await totalQuery.getCount()

        let totalPage = Math.ceil(total / take);
        if (page > totalPage) {
            throw new NotFoundException();
        }
        const currentPage = page;

        return new Pagination({
            data,
            total,
            totalPage,
            currentPage
        });
    }

    async detailCampaign(id: number) {
        try {
            const campaign = await this.getDetailCampaign(id);

            const images = await this.campaignImageRepository.createQueryBuilder('campaignImage')
                .select(
                    [
                        'idx',
                        'campaignIdx',
                        'file_name as fileName',
                        'ordering',
                    ]
                )
                .where('campaignIdx = :idx', {idx: id})
                .orderBy('ordering', 'ASC')
                .getRawMany()

            const campaignItem = await this.getCampaignItem(id);
            //campaignItem 배열 리스트에서 Idx 값 추출
            const campaignItemIdx = campaignItem.map((item) => {
                return item.idx;
            })

            let campaignItemSchedule = await this.campaignItemScheduleRepository.createQueryBuilder('campaignItemSchedule')
                .select(['*', 'DATE_FORMAT(FROM_UNIXTIME(campaignItemSchedule.date), "%Y-%m-%d") AS formattedDate'])
                .addSelect('campaignItemSchedule.priceDeposit * campaignItem.dc11 / 100 AS discountPriceDeposit')
                .leftJoin('campaignItemSchedule.campaignItem', 'campaignItem')
                .where('campaignItemSchedule.itemIdx IN (:...idx)', {idx: campaignItemIdx})
                .andWhere('campaignItemSchedule.date >= :now', {now: getUnixTimeStampByYmd()})
                .getRawMany();
            campaignItemSchedule = bufferToString(campaignItemSchedule);
            console.log("=>(campaign.service.ts:310) getUnixTimeStampByYmd()", getUnixTimeStampByYmd());
            // console.log("=>(campaign.service.ts:302) campaignItemSchedule", campaignItemSchedule);

            campaignItem.forEach((item) => {
                let channelNames = [];
                // @ts-ignore
                let jsonChannel = JSON.parse(item.channels);

                // 1.블로그 2.youtube 3.인스타그램 4.틱톡 5.티스토리 9.기타
                jsonChannel.forEach((item2) => {
                    switch (item2) {
                        case "1":
                            channelNames.push("네이버 블로그");
                            break;
                        case "2":
                            channelNames.push("유튜브");
                            break;
                        case "3":
                            channelNames.push("인스타그램");
                            break;
                        case "4":
                            channelNames.push("틱톡");
                            break;
                        case "5":
                            channelNames.push("티스토리");
                            break;
                        case "9":
                            channelNames.push("기타");
                            break;

                    }
                })
                item.channels = channelNames

                item.inStock = false;

                let inStock = campaignItemSchedule.filter((campaignItemScheduleItem, campaignItemScheduleIndex) => {
                    return campaignItemScheduleItem.itemIdx == item.idx;
                }).map((campaignItemScheduleItem, campaignItemScheduleIndex) => {
                    // 하나라도 재고가 있으면 true
                    if (campaignItemScheduleItem.stock > 0) {
                        return true;
                    }
                })
                //inStock 배열에서 true 값이 있으면 inStock = true
                if (inStock.indexOf(true) > -1) {
                    item.inStock = true;
                }

                //campaignItemSchedule 값 추가
                item.campaignItemSchedule = campaignItemSchedule.filter((campaignItemScheduleItem, campaignItemScheduleIndex) => {
                    return campaignItemScheduleItem.itemIdx == item.idx;
                }).map((campaignItemScheduleItem, campaignItemScheduleIndex) => {
                    return {
                        ...campaignItemScheduleItem,
                        active: moment.unix(campaignItemScheduleItem.date).format('YYYY-MM-DD'),
                    }
                })

            })

            let campaignImages = await this.getCampaignImages(id);
            campaignImages = bufferToString(campaignImages);
            let campaignCate = await this.getCampaignCate(id);
            campaignCate = bufferToString(campaignCate);
            let campaignCateArea = await this.getCampaignCateArea(id);
            campaignCateArea = bufferToString(campaignCateArea);
            let campaignPartner = await this.getCampaignPartner(id);
            campaignPartner = bufferToString(campaignPartner);
            let campaignReview = await this.getCampaignReview(id);
            campaignReview = bufferToString(campaignReview);
            // console.log("=>(campaign.service.ts:360) campaignItem", campaignItem);
            return {
                campaign,
                campaignItem,
                campaignImages,
                campaignCate,
                campaignCateArea,
                campaignPartner,
                campaignReview,
            };
        } catch (error) {
            console.log("=>(campaign.service.ts:315) error", error);
            throw new HttpException(error, 500);
        }
    }

    async getCampaign(id: number) {
        let data = await this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.campaignImage', 'campaignImage')
            .select(
                [
                    'campaign.idx as idx',
                    'campaign.name as name',
                    'campaign.cateIdx as cateIdx',
                    'CONVERT(campaign.name USING utf8) AS name',
                    'campaign.weight as weight',
                    'campaign.info as info',
                    'campaign.partnerIdx as partnerIdx',
                    '(SELECT file_name FROM campaignImage WHERE campaignImage.campaignIdx = campaign.idx ORDER BY ordering ASC LIMIT 1) as image',
                ]
            )
            .where('campaign.idx = :idx', {idx: id})
            .getRawOne()
        return bufferToString(data);
    }

    async getCampaignItem(id: number) {
        let query = this.campaignItemRepository.createQueryBuilder('campaignItem');
        query.select([
                    'campaignItem.*',
                    //  `(SELECT
                    //  IF(
                    //      schedule.priceDeposit > 0,
                    // // schedule.priceDeposit,
                    //      ROUND(CAST(schedule.priceDeposit * campaignItem.dc11 / 100 AS UNSIGNED), -2),
                    //      ROUND(CAST(campaignItem.priceOrig * campaignItem.dc11 / 100 AS UNSIGNED), -2)
                    //  )
                    //      FROM campaignItemSchedule schedule
                    //      JOIN campaignItem ON schedule.itemIdx = campaignItem.idx
                    //      WHERE campaignItem.campaignIdx = ${id}
                    //      AND schedule.stock > 0
                    //      AND campaignItem.remove = 0
                    //      AND schedule.date >= UNIX_TIMESTAMP(CURDATE())
                    //      ORDER BY price
                    //      LIMIT 1
                    //  ) as lowestPrice`,
                    'ROUND(CAST(campaignItem.priceOrig * campaignItem.dc11 / 100 AS UNSIGNED), -2) as lowestPrice',
                    'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignItemImage where itemIdx = campaignItem.idx order by ordering asc limit 1)) as image',
                ]
            )
        if (process.env.PORT == '3000' || process.env.PORT == '4000') {
            console.log("=>(campaign_model.service.ts:57) process.env.PORT", process.env.PORT);
            query.addSelect(
                (subQuery) =>
                    subQuery
                        .select('aws_url')
                        .from('campaignItemImage', 'ci')
                        .where('ci.itemIdx = campaignItem.idx')
                        .orderBy('ordering', 'ASC')
                        .limit(1),
                'image'
            )
        }
        query.addSelect('CONCAT(DATE(FROM_UNIXTIME(startDate)), " ~ ", DATE(FROM_UNIXTIME(endDate))) AS application_period')
        query.where('campaignItem.campaignIdx = :idx', {idx: id})
        query.andWhere('campaignItem.remove = :remove', {remove: 0})
        query.orderBy('campaignItem.ordering', 'ASC')
        const result = await query.getRawMany()
        return bufferToString(result);
    }

    async getCampaignImages(id: number) {
        let query = this.campaignImageRepository.createQueryBuilder('campaignImage');
        query.select(
                [
                    'idx',
                    'campaignIdx',
                    'CONCAT("https://wairi.co.kr/img/campaign/",file_name) as fileName',
                    'ordering',
                ]
            )
        if (process.env.PORT == '3000' || process.env.PORT == '4000') {
            query.addSelect( 'aws_url as fileName')
        }
        query.where('campaignIdx = :idx', {idx: id})
        query.orderBy('ordering', 'ASC')
        return await query.getRawMany();
    }

    async getCampaignCate(id: number) {
        return await this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.cate', 'cate')
            .select(
                [
                    'cate.idx as idx',
                    'cate.name as name',
                ]
            )
            .where('campaign.idx = :idx', {idx: id})
            .getRawOne()
    }

    async getCampaignCateArea(id: number) {
        return await this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.cateArea', 'cateArea')
            .select(
                [
                    'cateArea.idx as idx',
                    'cateArea.name as name',
                ]
            )
            .where('campaign.idx = :idx', {idx: id})
            .getRawOne()
    }

    async getCampaignPartner(id: number) {
        return await this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.partner', 'partner')
            .select(
                [
                    'partner.idx as idx',
                    'partner.corpName as corpName',
                    'partner.corpCeo as corpCeo',
                    'partner.corpTel as corpTel',
                ]
            )
            .where('campaign.idx = :idx', {idx: id})
            .getRawOne()
    }

    async getCampaignReview(id: number) {
        const data = await this.campaignReviewRepository.createQueryBuilder('campaignReview')
            .select(
                [
                    'idx',
                    'campaignIdx',
                    'content',
                    'images',
                    'regdate',
                ]
            )
            .where('campaignIdx = :idx', {idx: id})
            .orderBy('regdate', 'DESC')
            .getRawMany()

        data.map((item) => {
            item.images = JSON.parse(item.images);
            item.regdate = moment.unix(item.regdate).format('YYYY-MM-DD HH:mm:ss');
        })
        return data
    }

    async setRecency(
        campaignIdx: number,
        memberIdx: number,
        memberType: number,
        referer: string,
        refererHost: string,
        isSelf: number,
        ip: string) {
        console.log("-> memberType", memberType);
        const regdate = getUnixTimeStamp();
        const ymd = getYmd();

        const recent = new CampaignRecent()
        recent.campaignIdx = campaignIdx
        recent.memberIdx = memberIdx
        recent.memberType = memberType
        recent.ip = ip
        recent.regdate = regdate
        recent.ymd = ymd
        recent.referer = referer
        recent.refererHost = refererHost
        recent.isSelf = isSelf

        return await this.campaignRecentRepository.save(recent)
    }

    async getDetailCampaign(idx: number) {
        try {
            let query = this.campaignRepository.createQueryBuilder('campaign')
                .leftJoin('campaign.campaignItem', 'campaignItem')
                .leftJoin('campaign.campaignImage', 'campaignImage')
                .leftJoin('campaign.cate', 'cate')
                .leftJoin('campaign.cateArea', 'cateArea')
                .leftJoin('campaign.partner', 'partner')
            query.select([
                'campaign.idx as idx',
                'campaign.name as name',
                'campaign.weight as weight',
                'campaign.approvalMethod as approvalMethod',
                'campaign.grade as grade',
                'campaign.info as info',
                'campaign.production_guide as production_guide',
                'campaign.caution as caution',
                'campaign.tel as tel',
                'campaign.info as info',
                'campaign.addr1 as addr1',
                'campaign.addr2 as addr2',
                'campaign.addrLat as addrLat',
                'campaign.addrLng as addrLng',
                'campaign.checkIn as checkIn',
                'campaign.checkOut as checkOut',
                'campaign.roomType as roomType',
                'campaign.information as information',
                'campaign.otherInformation as otherInformation',
                'campaign.mainKeyword as mainKeyword',
                'campaign.mission as mission',
                'campaign.channels as channels',
                'campaign.blogCount as blogCount',
                'campaign.youtubeCount as youtubeCount',
                'campaign.instaCount as instaCount',
                'campaign.tiktokCount as tiktokCount',
                'campaign.tstoryCount as tstoryCount',
                'campaign.etcCount as etcCount',

                `(SELECT 
                    IF(
                        schedule.priceDeposit > 0, 
                        schedule.priceDeposit, 
                        ROUND(CAST(campaignItem.priceOrig * campaignItem.dc11 / 100 AS UNSIGNED), -2)
                    ) 
                        FROM campaignItemSchedule schedule 
                        JOIN campaignItem ON schedule.itemIdx = campaignItem.idx 
                        WHERE campaignItem.campaignIdx = campaign.idx 
                        AND schedule.stock > 0 
                        AND campaignItem.remove = 0 
                        AND schedule.date >= UNIX_TIMESTAMP(CURDATE()) 
                        ORDER BY price 
                        LIMIT 1
                    ) as lowestPrice`,
                'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
                'cate.name as cateName',
                'cate.idx as cateIdx',
                'cateArea.name as cateAreaName',
                'cateArea.idx as cateAreaIdx',
                'partner.corpName as partnerName',
            ]);
            if (process.env.PORT == '3000' || process.env.PORT == '4000') {
                console.log("=>(campaign_model.service.ts:57) process.env.PORT", process.env.PORT);
                query.addSelect(
                    (subQuery) =>
                        subQuery
                            .select('aws_url')
                            .from('campaignImage', 'ci')
                            .where('ci.campaignIdx = campaign.idx')
                            .orderBy('ordering', 'ASC')
                            .limit(1),
                    'image'
                )


            }

            query.where('campaign.idx = :idx', {idx: idx})
                // .andWhere('campaign.remove = :remove', {remove: 0})
                // .andWhere('campaignItem.remove = :cr', {cr: 0})
                // .andWhere('campaign.status = 200')
                .andWhere('partner.status = :status', {status: 1});

            let result = await query.getRawOne();
            result = bufferToString(result);
            if (result.mainKeyword) {
                result.mainKeyword = result.mainKeyword
                    .replace('[', '')
                    .replace(']', '')
                    .split(',')
                    .map((keyword: string) => keyword.trim());
            }

            // console.log("=>(campaign.service.ts:671) result", result);
            return result;
            //info , production_guide, caution = "" -> null
            if (result.info == "") {
                result.info = null;
            }
            if (result.production_guide == "") {
                result.production_guide = null;
            }
            if (result.caution == "") {
                result.caution = null;
            }

            console.log("=>(campaign.service.ts:521) result", result);

            return result;
        } catch (error) {
            console.log("=>(campaign.service.ts:532) error", error);
            throw new HttpException(error, 500);
        }
    }

    async getItemSchedule(idx: number, start_day: string, end_day: string) {
        try {
            let data = await this.campaignItemScheduleRepository.createQueryBuilder('campaignItemSchedule')
                .leftJoin('campaignItemSchedule.campaignItem', 'campaignItem')
                .leftJoin('campaignItem.campaign', 'campaign')
                .select([
                    'campaignItem.idx as idx',
                    'campaignItem.name as name',
                    'campaignItem.priceOrig as priceOrig',
                    'campaignItem.calcType1 as calcType1',
                    'campaignItem.calcType2 as calcType2',
                    'campaignItem.sellType as sellType',
                    'campaignItemSchedule.stock as stock',
                    'campaignItemSchedule.priceDeposit as priceDeposit',
                    'DATE_FORMAT(FROM_UNIXTIME(campaignItemSchedule.date), "%Y-%m-%d") AS date'
                ])
                // .addSelect(`(${FROM_UNIXTIME('campaignItem.startDate')})`, 'startDate')
                // .addSelect(`(${FROM_UNIXTIME('campaignItem.endDate')})`, 'endDate')
                // .addSelect(`(${FROM_UNIXDATE('campaignItemSchedule.date')})`, 'date')
                .where('campaignItem.remove = :remove', {remove: 0})
                .andWhere('campaign.idx = :idx', {idx: idx})
                //UNIX_TIMESTAMP 로 campaignItemSchedule.date 비교
                .andWhere(`campaignItemSchedule.date >= UNIX_TIMESTAMP('${start_day}')`)
                .andWhere(`campaignItemSchedule.date <= UNIX_TIMESTAMP('${end_day}')`)
                .getRawMany();
            data = bufferToString(data);
            // console.log("=>(campaign.service.ts:560) data", data);
            return data;
        } catch (error) {
            console.log("=>(campaign.service.ts:562) error", error);
            throw new HttpException(error, 500);
        }
    }

    async getActiveItemSchedule(idx: number, start_day: number, end_day: number, now: number) {
        try {
            let data = await this.campaignItemScheduleRepository.createQueryBuilder('campaignItemSchedule')
                .leftJoin('campaignItemSchedule.campaignItem', 'campaignItem')
                .leftJoin('campaignItem.campaign', 'campaign')
                .select([
                    'campaignItem.idx as idx',
                    'campaignItem.name as name',
                    'campaignItem.priceOrig as priceOrig',
                    'campaignItem.calcType1 as calcType1',
                    'campaignItem.calcType2 as calcType2',
                    'campaignItem.sellType as sellType',
                    'campaignItemSchedule.stock as stock',
                    'campaignItemSchedule.priceDeposit as priceDeposit',
                    'FROM_UNIXTIME(campaignItemSchedule.date,("%Y-%m-%d")) as active',
                ])
                .addSelect(`(${FROM_UNIXDATE('campaignItem.startDate')})`, 'startDay')
                .addSelect(`(${FROM_UNIXDATE('campaignItem.endDate')})`, 'endDay')
                .addSelect(`(${FROM_UNIXTIME('campaignItemSchedule.date')})`, 'date')
                .where('campaignItem.remove = :remove', {remove: 0})
                .andWhere('campaignItemSchedule.stock > 0')
                .andWhere('campaignItemSchedule.date >= :start_day', {start_day: start_day})
                .andWhere('campaignItemSchedule.date < :end_day', {end_day: end_day + 86400})
                .andWhere('campaign.idx = :idx', {idx: idx})
                .getRawMany();
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async recentList(take: number, page: number, memberIdx: number) {
        try {
            let query = this.campaignRecentRepository.createQueryBuilder('campaignRecent');
            query.leftJoin('campaignRecent.campaign', 'campaign')
            query.leftJoin('campaign.campaignItem', 'campaignItem')
            query.leftJoin('campaign.campaignImage', 'campaignImage')
            query.leftJoin('campaign.cate', 'cate')
            query.leftJoin('campaign.cateArea', 'cateArea')
            query.leftJoin('campaign.partner', 'partner')
            query.select([
                    'campaign.idx as idx',
                    'campaign.name as name',
                    'campaign.weight as weight',
                    'min(campaignItem.priceOrig) as lowestPriceOrig',
                    'min(campaignItem.calcType1) as lowestPriceCalcType1',
                    'min(campaignItem.calcType2) as lowestPriceCalcType2',
                    'min(campaignItem.sellType) as lowestPriceSellType',
                    '(SELECT file_name FROM campaignImage WHERE campaignImage.campaignIdx = campaign.idx ORDER BY ordering ASC LIMIT 1) as image',
                    'cate.name as cateName',
                    'cate.idx as cateIdx',
                    'cateArea.name as cateAreaName',
                    'partner.corpName as partnerName',
                ])
            if (process.env.PORT == '3000' || process.env.PORT == '4000') {
                console.log("=>(campaign_model.service.ts:57) process.env.PORT", process.env.PORT);
                query.addSelect(
                    (subQuery) =>
                        subQuery
                            .select('aws_url')
                            .from('campaignImage', 'ci')
                            .where('ci.campaignIdx = campaign.idx')
                            .orderBy('ordering', 'ASC')
                            .limit(1),
                    'image'
                )
            }
            query.where('campaignRecent.memberIdx = :memberIdx', {memberIdx: memberIdx})
            query.andWhere('campaign.remove = :remove', {remove: 0})
            query.orderBy('campaignRecent.regdate', 'DESC')
            query.groupBy('campaign.idx')
            query.offset(take * (page - 1))
            query.limit(take)
            const data = await query.getRawMany();
            bufferToString(data);
            const total = await this.campaignRecentRepository.createQueryBuilder('campaignRecent')
                .leftJoin('campaignRecent.campaign', 'campaign')
                .where('campaignRecent.memberIdx = :memberIdx', {memberIdx: memberIdx})
                .andWhere('campaign.remove = :remove', {remove: 0})
                .getCount()

            let totalPage = Math.ceil(total / take);
            if (page > totalPage) {
                throw new NotFoundException();
            }
            const currentPage = page;

            return new Pagination({
                data,
                total,
                totalPage,
                currentPage
            });
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async setCampaignFav(memberIdx: number, campaignIdx: number) {
        try {
            const regdate = getUnixTimeStamp();
            const ymd = getYmd();

            const fav = new CampaignFav()
            fav.memberIdx = memberIdx
            fav.campaignIdx = campaignIdx
            fav.regdate = regdate

            return await this.campaignFavRepository.save(fav)

        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async getRecommendedSearchWords(type: string, limit: number = 5) {
        try {
            const weight_query = this.campaignRepository.createQueryBuilder('campaign');
            weight_query.leftJoin('campaign.cate', 'cate')
            weight_query.leftJoin('campaign.cateArea', 'cateArea')
            weight_query.select([
                'campaign.idx as idx',
                'campaign.name as name',
                'campaign.weight as count',
                'campaign.approvalMethod as approvalMethod',
                'campaign.grade as grade',
                'cate.name as cateName',
                'cateArea.name as cateAreaName',
                'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
            ])
            if (process.env.PORT == '3000' || process.env.PORT == '4000') {
                console.log("=>(campaign_model.service.ts:57) process.env.PORT", process.env.PORT);
                weight_query.addSelect(
                    (subQuery) =>
                        subQuery
                            .select('aws_url')
                            .from('campaignImage', 'ci')
                            .where('ci.campaignIdx = campaign.idx')
                            .orderBy('ordering', 'ASC')
                            .limit(1),
                    'image'
                )
            }
            weight_query.where('campaign.remove = :remove', {remove: 0})
            weight_query.andWhere('campaign.status = 200')
            weight_query.orderBy('campaign.weight', 'DESC')
            weight_query.limit(limit)
            const weight = await weight_query.getRawMany();

            const submit_query = this.campaignSubmit.createQueryBuilder('campaignSubmit');
            submit_query.select([
                'campaignSubmit.campaignIdx as idx',
                'count(*) as count',
                'campaign.name as name',
                'campaign.weight as weight',
                'campaign.approvalMethod as approvalMethod',
                'campaign.grade as grade',
                'cate.name as cateName',
                'cateArea.name as cateAreaName',
                'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
            ])
            if (process.env.PORT == '3000' || process.env.PORT == '4000') {
                console.log("=>(campaign_model.service.ts:57) process.env.PORT", process.env.PORT);
                submit_query.addSelect(
                    (subQuery) =>
                        subQuery
                            .select('aws_url')
                            .from('campaignImage', 'ci')
                            .where('ci.campaignIdx = campaign.idx')
                            .orderBy('ordering', 'ASC')
                            .limit(1),
                    'image'
                )
            }
            submit_query.leftJoin('campaignSubmit.campaign', 'campaign')
            submit_query.leftJoin('campaign.cate', 'cate')
            submit_query.leftJoin('campaign.cateArea', 'cateArea')
            submit_query.where('campaign.remove = :remove', {remove: 0})
            submit_query.andWhere('campaign.status = 200')
            //wherein campaignSubmit.status = 400, 500, 700
            submit_query.andWhere('campaignSubmit.status IN (:...status)', {status: [400, 500, 700]})
            submit_query.groupBy('campaignSubmit.campaignIdx')
            submit_query.orderBy('count', 'DESC')
            submit_query.limit(limit)
            const submit = await submit_query.getRawMany();

            if (type == 'weight') {
                return bufferToString(weight);
            } else if (type == 'submit') {
                return bufferToString(submit);
            } else {
                return [];
            }
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async getLowestPrice(data) {
        console.log('========' + data.isArray)
        const campaignItemLowestPrice = await this.campaignRepository
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
            .andWhere('c.remove = 0')
            .orderBy('c.weight', 'DESC')
            .addOrderBy('c.regdate', 'DESC')
            .getRawMany();

        let result = [];
        data.forEach((item) => {
            campaignItemLowestPrice.forEach((item2) => {
                if (item.idx == item2.campaignIdx) {
                    item.lowestPriceOrig = item2.lowestPrice;
                    item.discountPercentage = item2.dc11;
                    item.discountPrice = Math.round(item.lowestPriceOrig * item.discountPercentage / 100);
                    result.push(item);
                }
            })
        });

        return result;
    }

    async getCampaignSchedule(idx: number) {
        let data = await this.campaignItemScheduleRepository.createQueryBuilder('campaignItemSchedule')
            .leftJoin('campaignItemSchedule.campaignItem', 'campaignItem')
            .leftJoin('campaignItem.campaign', 'campaign')
            .select([
                'campaignItemSchedule.idx as idx',
                'campaignItem.idx as itemIdx',
                'campaignItem.priceOrig as priceOrig',
                'campaignItem.dc11 as dc11',
                'campaignItem.maxDays as maxDays',
                'campaignItem.minDays as minDays',

                'campaignItemSchedule.stock as stock',
                'campaignItemSchedule.priceDeposit as priceDeposit',
                'campaignItemSchedule.date as unixDate',
            ])
            .addSelect(`(${FROM_UNIXTIME('campaignItem.startDate')})`, 'startDate')
            .addSelect(`(${FROM_UNIXTIME('campaignItem.endDate')})`, 'endDate')
            .addSelect(`(${FROM_UNIXDATE('campaignItemSchedule.date')})`, 'date')
            .addSelect('date as unixdate')

            .where('campaignItem.remove = :remove', {remove: 0})
            .andWhere('campaignItemSchedule.date >= UNIX_TIMESTAMP(CURDATE())')
            .andWhere('campaign.idx = :idx', {idx: idx})
            .andWhere('campaignItemSchedule.stock > 0')
            .orderBy('campaignItem.ordering', 'ASC')
            .getRawMany();
        data = bufferToString(data);
        //data 에서 신청 가능 date 값만 추출
        let date = data.map((item) => {
            return item.date;
        })
        date = date.filter((item, index) => {
            return date.indexOf(item) === index;
        })
        date.sort((a, b) => {
            // @ts-ignore
            return moment(a) - moment(b);
        })


        let items = [];
        date.forEach((item, index) => {
            //date 값에 해당하는 campaignItemSchedule 값 추가
            let itemSchedule = data.filter((item2) => {
                return item2.date == item;
            })
            items.push({
                date: item,
                itemSchedule: itemSchedule
            })
        })

        return {
            active: date,
            items
        };
    }

    async getCampaignItemSchedule(idx: number) {
        console.log("=>(campaign.service.ts:854) idx", idx);
        let data = await this.campaignItemScheduleRepository.createQueryBuilder('campaignItemSchedule')
            .leftJoin('campaignItemSchedule.campaignItem', 'campaignItem')
            .select([
                'campaignItemSchedule.idx as idx',
                'campaignItem.idx as itemIdx',
                'campaignItem.priceOrig as priceOrig',
                'campaignItem.dc11 as dc11',
                'campaignItem.maxDays as maxDays',
                'campaignItem.minDays as minDays',
            ])
            .addSelect(`(${FROM_UNIXTIME('campaignItem.startDate')})`, 'startDate')
            .addSelect(`(${FROM_UNIXTIME('campaignItem.endDate')})`, 'endDate')
            .addSelect(`(${FROM_UNIXDATE('campaignItemSchedule.date')})`, 'date')
            .where('campaignItem.remove = :remove', {remove: 0})
            .andWhere('campaignItemSchedule.date >= UNIX_TIMESTAMP(CURDATE())')
            .andWhere('campaignItemSchedule.itemIdx = :idx', {idx: idx})
            .orderBy('campaignItem.ordering', 'ASC')
            .getRawMany();

        //data 에서 신청 가능 date 값만 추출
        let date = data.map((item) => {
            return item.date;
        })
        date = date.filter((item, index) => {
            return date.indexOf(item) === index;
        })
        date.sort((a, b) => {
            // @ts-ignore
            return moment(a) - moment(b);
        })

        return {
            active: date,
            data
        };
    }

    async getCampaignItemByIdx(idx: number) {
        let data = await this.campaignItemRepository.createQueryBuilder('campaignItem')
            .leftJoin('campaignItem.campaign', 'campaign')
            .select('campaignItem.*')
            .addSelect(`(${FROM_UNIXTIME('campaignItem.startDate')})`, 'startDate')
            .addSelect(`(${FROM_UNIXTIME('campaignItem.endDate')})`, 'endDate')
            .where('campaignItem.remove = :remove', {remove: 0})
            .andWhere('campaignItem.idx = :idx', {idx: idx})
            .getRawOne();
        return bufferToString(data);
    }

    async delCampaignFav(idx: number, campaignIdx: number) {
        try {
            return await this.campaignFavRepository.createQueryBuilder('campaignFav')
                .delete()
                .where('campaignFav.memberIdx = :idx', {idx: idx})
                .andWhere('campaignFav.campaignIdx = :campaignIdx', {campaignIdx: campaignIdx})
                .execute();
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async favList(take: number, page: number, idx: number) {
        try {
            let query = this.campaignFavRepository.createQueryBuilder('campaignFav');
            query.leftJoin('campaignFav.campaign', 'campaign')
            query.leftJoin('campaign.campaignItem', 'campaignItem')
            query.leftJoin('campaign.campaignImage', 'campaignImage')
            query.leftJoin('campaign.cate', 'cate')
            query.leftJoin('campaign.cateArea', 'cateArea')
            query.leftJoin('campaign.partner', 'partner')
            query.select([
                'campaign.idx as idx',
                'campaign.name as name',
                'campaign.weight as weight',
                'campaign.status as status',
                'campaign.approvalMethod as approvalMethod',
                'campaign.grade as grade',
                'min(campaignItem.priceOrig) as lowestPriceOrig',
                'min(campaignItem.calcType1) as lowestPriceCalcType1',
                'min(campaignItem.calcType2) as lowestPriceCalcType2',
                'min(campaignItem.sellType) as lowestPriceSellType',
                'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
                'cate.name as cateName',
                'cate.idx as cateIdx',
                'cateArea.name as cateAreaName',
                'partner.corpName as partnerName',
            ])
            if (process.env.PORT == '3000' || process.env.PORT == '4000') {
                console.log("=>(campaign_model.service.ts:57) process.env.PORT", process.env.PORT);
                query.addSelect(
                    (subQuery) =>
                        subQuery
                            .select('aws_url')
                            .from('campaignImage', 'ci')
                            .where('ci.campaignIdx = campaign.idx')
                            .orderBy('ordering', 'ASC')
                            .limit(1),
                    'image'
                )
            }
            query.where('campaignFav.memberIdx = :idx', {idx: idx})
            query.andWhere('campaign.remove = :remove', {remove: 0})
            query.orderBy('campaignFav.regdate', 'DESC')
            query.groupBy('campaign.idx')
            query.offset(take * (page - 1))
            query.limit(take)
            let data = await query.getRawMany();

            const campaignItemLowestPrice = await this.getCampaignLowestPrice();

            data = bufferToString(data)
            let result = [];
            data.forEach((item) => {
                campaignItemLowestPrice.forEach((item2) => {
                    if (item.idx == item2.campaignIdx) {
                        item.lowestPriceOrig = item2.lowestPrice;
                        item.discountPercentage = item2.dc11;
                        item.discountPrice = Math.round(item.lowestPriceOrig * item.discountPercentage / 100);
                        result.push(item);
                    }
                })
            });

            const total = await this.campaignFavRepository.createQueryBuilder('campaignFav')
                .leftJoin('campaignFav.campaign', 'campaign')
                .where('campaignFav.memberIdx = :idx', {idx: idx})
                .andWhere('campaign.remove = :remove', {remove: 0})
                .getCount()

            let totalPage = Math.ceil(total / take);

            if (page > totalPage) {
                throw new NotFoundException();
            }
            const currentPage = page;

            return new Pagination({
                data,
                total,
                totalPage,
                currentPage
            });
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async getCampaignLowestPrice() {
        return await this.campaignRepository
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
            .andWhere('c.remove = 0')
            .orderBy('c.weight', 'DESC')
            .addOrderBy('c.regdate', 'DESC')
            .getRawMany();
    }
}
