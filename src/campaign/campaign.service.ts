import {HttpException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateCampaignDto} from './dto/create-campaign.dto';
import {UpdateCampaignDto} from './dto/update-campaign.dto';
import {Campaign} from "../../entity/entities/Campaign";
import {CampaignItem} from "../../entity/entities/CampaignItem";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Pagination} from '../paginate'
import {PaginationOptions} from '../paginate/pagination.option'
import {Cate} from "../../entity/entities/Cate";
import {CateArea} from "../../entity/entities/CateArea";
import {Partner} from "../../entity/entities/Partner";
import {CampaignImage} from "../../entity/entities/CampaignImage";
import {CampaignReview} from "../../entity/entities/CampaignReview";
import {CampaignRecent} from "../../entity/entities/CampaignRecent";
import {CampaignItemSchedule} from "../../entity/entities/CampaignItemSchedule";
import {CampaignSubmit} from "../../entity/entities/CampaignSubmit";
import {CampaignFav} from "../../entity/entities/CampaignFav";
import {bufferToString, FROM_UNIXDATE, FROM_UNIXTIME, getUnixTimeStamp, getYmd} from "../util/common"
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

    async search(keyword: string) {
        const {take, page} = {take: 10, page: 1};
        const data = await this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.campaignItem', 'campaignItem')
            .leftJoin('campaign.campaignImage', 'campaignImage')
            .leftJoin('campaign.cate', 'cate')
            .leftJoin('campaign.cateArea', 'cateArea')
            .leftJoin('campaign.partner', 'partner')
            .select([
                'campaign.idx as idx',
                'campaign.name as name',
                'campaign.weight as weight',
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
            .where('(campaign.remove = :remove AND campaign.name like :campaignKeyword) OR (campaignItem.remove = :itemRemove AND campaignItem.name like :itemKeyword)', {
                remove: 0,
                campaignKeyword: '%' + keyword + '%',
                itemRemove: 0,
                itemKeyword: '%' + keyword + '%',
            })
            .orderBy('campaign.idx', 'DESC')
            .addOrderBy('campaign.weight', 'DESC')
            .groupBy('campaign.idx')
            .offset(take * (page - 1))
            .limit(take)
            .getRawMany();

        const campaignItemLowestPrice = await this.getCampaignLowestPrice();

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

        const total = await this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.campaignItem', 'campaignItem')
            .where('campaign.remove = :remove', {remove: 0})
            .andWhere('campaign.name like :keyword', {keyword: '%' + keyword + '%'})
            .orWhere('campaignItem.name like :keyword', {keyword: '%' + keyword + '%'})
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

    async mainList(take, page, cate, cateArea) {

        // 	$searchs = [
        // 			'campaign.status>='=>200,
        // 			'campaign.status<='=>700,
        // 			'campaign.cateIdx'=>$cateIdx,
        // 			'partner.status'=>1,
        // 			'setCampaignMemberTarget'=>$this->memberType,
        // 		];

        // const {take, page} = options;
        const query = this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.campaignItem', 'campaignItem')
            .leftJoin('campaign.campaignImage', 'campaignImage')
            .leftJoin('campaignItem.campaignItemSchedule', 'campaignItemSchedule')
            .leftJoin('campaign.cate', 'cate')
            .leftJoin('campaign.cateArea', 'cateArea')
            .leftJoin('campaign.partner', 'partner')
            .select([
                'campaign.idx as idx',
                'campaign.name as name',
                'campaign.weight as weight',
                // 'min(campaignItem.priceOrig) as lowestPriceOrig',
                // 'min(campaignItem.priceDeposit) as lowestPriceDeposit',
                // 'min(campaignItemSchedule.priceDeposit) as lowestSchedulePriceDeposit',
                'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
                'cate.name as cateName',
                'cate.idx as cateIdx',
                'cateArea.name as cateAreaName',
                'cateArea.idx as cateAreaIdx',
                // 'partner.corpName as partnerName',
            ])
            .where('campaign.remove = :remove', {remove: 0})
            // .andWhere('campaignItem.remove = :remove', {remove: 0})
            .andWhere('campaign.status >= :t', {t: 200})
            .andWhere('campaign.status <= :s', {s: 700})
            .andWhere('partner.status = :status', {status: 1})
            .orderBy('campaign.weight', 'DESC')
            .addOrderBy('campaign.regdate', 'DESC')
            .groupBy('campaign.idx')
            .offset(take * (page - 1))
            .limit(take)

        if (cate) {
            query.andWhere('campaign.cateIdx = :cate', {cate: cate})
        }
        if (cateArea) {
            query.andWhere('campaign.cateAreaIdx = :cateArea', {cateArea: cateArea})
        }

        const data = await query.getRawMany();

        const campaignItemLowestPrice = await this.getCampaignLowestPrice();

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
        const campaign = await this.getDetailCampaign(id);
        // return campaign;
        const campaignItem = await this.getCampaignItem(id);
        //campaignItem 배열 리스트에서 Idx 값 추출
        const campaignItemIdx = campaignItem.map((item) => {
            return item.idx;
        })

        const campaignItemSchedule = await this.campaignItemScheduleRepository.createQueryBuilder('campaignItemSchedule')
            .select(['*', 'DATE_FORMAT(FROM_UNIXTIME(campaignItemSchedule.date), "%Y-%m-%d") AS formattedDate'])
            .where('campaignItemSchedule.itemIdx IN (:...idx)', {idx: campaignItemIdx})
            .andWhere('campaignItemSchedule.date >= :now', {now: getUnixTimeStamp()})
            .getRawMany();

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
        const campaignImages = await this.getCampaignImages(id);
        const campaignCate = await this.getCampaignCate(id);
        const campaignCateArea = await this.getCampaignCateArea(id);
        const campaignPartner = await this.getCampaignPartner(id);
        const campaignReview = await this.getCampaignReview(id);

        const result = {
            campaign,
            campaignItem,
            campaignImages,
            campaignCate,
            campaignCateArea,
            campaignPartner,
            campaignReview,
        }

        return result;
    }

    async getCampaign(id: number) {
        console.log('getCampaign' + id)
        return await this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.campaignImage', 'campaignImage')
            .select(
                [
                    'campaign.idx as idx',
                    'campaign.name as name',
                    'CONVERT(campaign.name USING utf8) AS name',
                    'campaign.weight as weight',
                    'campaign.info as info',
                    'campaign.partnerIdx as partnerIdx',
                    '(SELECT file_name FROM campaignImage WHERE campaignImage.campaignIdx = campaign.idx ORDER BY ordering ASC LIMIT 1) as image',
                ]
            )
            .where('campaign.idx = :idx', {idx: id})
            .getRawOne()
    }

    async getCampaignItem(id: number) {
        let result = await this.campaignItemRepository.createQueryBuilder('campaignItem')
            .select([
                    'campaignItem.*',
                    `(SELECT 
                    IF(
                        schedule.priceDeposit > 0, 
                        schedule.priceDeposit, 
                        ROUND(CAST(campaignItem.priceOrig * campaignItem.dc11 / 100 AS UNSIGNED), -2)
                    ) 
                        FROM campaignItemSchedule schedule 
                        JOIN campaignItem ON schedule.itemIdx = campaignItem.idx 
                        WHERE campaignItem.campaignIdx = ${id}
                        AND schedule.stock > 0 
                        AND campaignItem.remove = 0 
                        AND schedule.date >= UNIX_TIMESTAMP(CURDATE()) 
                        ORDER BY price 
                        LIMIT 1
                    ) as lowestPrice`,
                    'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignItemImage where itemIdx = campaignItem.idx order by ordering asc limit 1)) as image',
                ]
            )
            .addSelect('CONCAT(DATE(FROM_UNIXTIME(startDate)), " ~ ", DATE(FROM_UNIXTIME(endDate))) AS application_period')
            .where('campaignItem.campaignIdx = :idx', {idx: id})
            .andWhere('campaignItem.remove = :remove', {remove: 0})
            .orderBy('campaignItem.ordering', 'ASC')
            .getRawMany()

        return result;
    }

    async getCampaignImages(id: number) {
        return await this.campaignImageRepository.createQueryBuilder('campaignImage')
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
                'campaign.info as info',
                'campaign.production_guide as production_guide',
                'campaign.caution as caution',
                'campaign.tel as tel',
                'campaign.addr1 as addr1',
                'campaign.addr2 as addr2',
                'campaign.addrLat as addrLat',
                'campaign.addrLng as addrLng',
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

            query.where('campaign.idx = :idx', {idx: idx})
                .andWhere('campaign.remove = :remove', {remove: 0})
                .andWhere('campaignItem.remove = :cr', {cr: 0})
                .andWhere('campaign.status = 200')
                .andWhere('partner.status = :status', {status: 1});

            const result = await query.getRawOne();
            console.log("=>(campaign.service.ts:521) result", result);

            return result;
        } catch (error) {
            console.log(error)
            throw error;
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
                ])
                .addSelect(`(${FROM_UNIXTIME('campaignItem.startDate')})`, 'startDate')
                .addSelect(`(${FROM_UNIXTIME('campaignItem.endDate')})`, 'endDate')
                .addSelect(`(${FROM_UNIXTIME('campaignItemSchedule.date')})`, 'date')
                .where('campaignItem.remove = :remove', {remove: 0})
                .andWhere('campaign.idx = :idx', {idx: idx})
                //UNIX_TIMESTAMP 로 campaignItemSchedule.date 비교
                .andWhere(`campaignItemSchedule.date >= UNIX_TIMESTAMP('${start_day}')`)
                .andWhere(`campaignItemSchedule.date <= UNIX_TIMESTAMP('${end_day}')`)
                .getRawMany();
            console.log("=>(campaign.service.ts:446) start_day", start_day);
            console.log("-> data", data);
            return data;
        } catch (error) {
            console.log(error)
            throw error;
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
                    'FROM_UNIXTIME(date,("%Y-%m-%d")) as active',
                ])
                .addSelect(`(${FROM_UNIXTIME('campaignItem.startDate')})`, 'startDay')
                .addSelect(`(${FROM_UNIXTIME('campaignItem.endDate')})`, 'endDay')
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
            let data = await this.campaignRecentRepository.createQueryBuilder('campaignRecent')
                .leftJoin('campaignRecent.campaign', 'campaign')
                .leftJoin('campaign.campaignItem', 'campaignItem')
                .leftJoin('campaign.campaignImage', 'campaignImage')
                .leftJoin('campaign.cate', 'cate')
                .leftJoin('campaign.cateArea', 'cateArea')
                .leftJoin('campaign.partner', 'partner')
                .select([
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
                .where('campaignRecent.memberIdx = :memberIdx', {memberIdx: memberIdx})
                .andWhere('campaign.remove = :remove', {remove: 0})
                .orderBy('campaignRecent.regdate', 'DESC')
                .groupBy('campaign.idx')
                .offset(take * (page - 1))
                .limit(take)
                .getRawMany();

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
            const weight = await this.campaignRepository.createQueryBuilder('campaign')
                .leftJoin('campaign.cate', 'cate')
                .leftJoin('campaign.cateArea', 'cateArea')
                .select([
                    'campaign.idx as idx',
                    'campaign.name as name',
                    'campaign.weight as count',
                    'cate.name as cateName',
                    'cateArea.name as cateAreaName',
                    'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
                ])
                .where('campaign.remove = :remove', {remove: 0})
                .andWhere('campaign.status = 200')
                .orderBy('campaign.weight', 'DESC')
                .limit(limit)
                .getRawMany();

            const submit = await this.campaignSubmit.createQueryBuilder('campaignSubmit')
                .select([
                    'campaignSubmit.campaignIdx as idx',
                    'count(*) as count',
                    'campaign.name as name',
                    'campaign.weight as weight',
                    'cate.name as cateName',
                    'cateArea.name as cateAreaName',
                    'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignImage where campaignIdx = campaign.idx order by ordering asc limit 1)) as image',
                ])
                .leftJoin('campaignSubmit.campaign', 'campaign')
                .leftJoin('campaign.cate', 'cate')
                .leftJoin('campaign.cateArea', 'cateArea')
                .where('campaign.remove = :remove', {remove: 0})
                .andWhere('campaign.status = 200')
                //wherein campaignSubmit.status = 400, 500, 700
                .andWhere('campaignSubmit.status IN (:...status)', {status: [400, 500, 700]})
                .groupBy('campaignSubmit.campaignIdx')
                .orderBy('count', 'DESC')
                .limit(limit)
                .getRawMany();

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
            .where('campaignItem.remove = :remove', {remove: 0})
            .andWhere('campaignItemSchedule.date >= UNIX_TIMESTAMP(CURDATE())')
            .andWhere('campaign.idx = :idx', {idx: idx})
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
        console.log("=>(campaign.service.ts:870) data", data);

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
        return await this.campaignItemRepository.createQueryBuilder('campaignItem')
            .leftJoin('campaignItem.campaign', 'campaign')
            .select('campaignItem.*')
            .addSelect(`(${FROM_UNIXTIME('campaignItem.startDate')})`, 'startDate')
            .addSelect(`(${FROM_UNIXTIME('campaignItem.endDate')})`, 'endDate')
            .where('campaignItem.remove = :remove', {remove: 0})
            .andWhere('campaignItem.idx = :idx', {idx: idx})
            .getRawOne();
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
            let data = await this.campaignFavRepository.createQueryBuilder('campaignFav')
                .leftJoin('campaignFav.campaign', 'campaign')
                .leftJoin('campaign.campaignItem', 'campaignItem')
                .leftJoin('campaign.campaignImage', 'campaignImage')
                .leftJoin('campaign.cate', 'cate')
                .leftJoin('campaign.cateArea', 'cateArea')
                .leftJoin('campaign.partner', 'partner')
                .select([
                    'campaign.idx as idx',
                    'campaign.name as name',
                    'campaign.weight as weight',
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
                .where('campaignFav.memberIdx = :idx', {idx: idx})
                .andWhere('campaign.remove = :remove', {remove: 0})
                .orderBy('campaignFav.regdate', 'DESC')
                .groupBy('campaign.idx')
                .offset(take * (page - 1))
                .limit(take)
                .getRawMany();

            const campaignItemLowestPrice = await this.getCampaignLowestPrice();

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
            console.log("=>(campaign.service.ts:994) data", data);

            const total = await this.campaignFavRepository.createQueryBuilder('campaignFav')
                .leftJoin('campaignFav.campaign', 'campaign')
                .where('campaignFav.memberIdx = :idx', {idx: idx})
                .andWhere('campaign.remove = :remove', {remove: 0})
                .getCount()

            let totalPage = Math.ceil(total / take);
            console.log("=>(campaign.service.ts:959) totalPage", totalPage);
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
        return  await this.campaignRepository
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
