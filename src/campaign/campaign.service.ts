import {Injectable, NotFoundException} from '@nestjs/common';
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
import {getUnixTimeStamp, getYmd} from "../util/common"
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
    ) {
        //할인율 기본값
        this.discountRate = 0;

        //추가할인율 기본값
        this.additionalDiscountRate = 0;
    }

    async mainList(options: PaginationOptions) {
        const {take, page} = options;
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
                '(SELECT file_name FROM campaignImage WHERE campaignImage.campaignIdx = campaign.idx ORDER BY ordering ASC LIMIT 1) as image',
                'cate.name as cateName',
                'cate.idx as cateIdx',
                'cateArea.name as cateAreaName',
                'partner.corpName as partnerName',
            ])
            .where('campaign.remove = :remove', {remove: 0})
            .orderBy('campaign.idx', 'DESC')
            .addOrderBy('campaign.weight', 'DESC')
            .groupBy('campaign.idx')
            .offset(take * (page - 1))
            .limit(take)
            .getRawMany();

        const total = await this.campaignRepository.createQueryBuilder('campaign')
            .where('campaign.remove = :remove', {remove: 0}).getCount()

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

    async findOne(id: number) {

        const campaign = await this.getCampaign(id);
        const campaignItem = await this.getCampaignItem(id);
        const campaignImages = await this.getCampaignImages(id);
        const campaignCate = await this.getCampaignCate(id);
        const campaignCateArea = await this.getCampaignCateArea(id);
        const campaignPartner = await this.getCampaignPartner(id);
        const campaignReview = await this.getCampaignReview(id);

        const result = {
            ...campaign,
            campaignItem,
            campaignImages,
            campaignCate,
            campaignCateArea,
            campaignPartner,
            campaignReview,
        }

        // this.setRecency(id)
        return result;
    }

    getCampaign(id: number) {
        return this.campaignRepository.createQueryBuilder('campaign')
            .leftJoin('campaign.campaignImage', 'campaignImage')
            .select(
                [
                    'campaign.idx as idx',
                    'campaign.name as name',
                    'campaign.weight as weight',
                    '(SELECT file_name FROM campaignImage WHERE campaignImage.campaignIdx = campaign.idx ORDER BY ordering ASC LIMIT 1) as image',
                ]
            )
            .where('campaign.idx = :idx', {idx: id})
            .getRawOne()
    }

    getCampaignItem(id: number) {
        return this.campaignItemRepository.createQueryBuilder('campaignItem')
            .leftJoinAndSelect('campaignItem.campaignItemSchedule', 'campaignItemSchedule')
            .where('campaignItem.campaignIdx = :idx', {idx: id})
            .andWhere('campaignItem.remove = :remove', {remove: 0})
            .orderBy('campaignItem.priceOrig', 'DESC')
            .getMany()
    }

    getCampaignImages(id: number) {
        return this.campaignImageRepository.createQueryBuilder('campaignImage')
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

    getCampaignCate(id: number) {
        return this.campaignRepository.createQueryBuilder('campaign')
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

    getCampaignCateArea(id: number) {
        return this.campaignRepository.createQueryBuilder('campaign')
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

    getCampaignPartner(id: number) {
        return this.campaignRepository.createQueryBuilder('campaign')
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

    async setRecency(campaignIdx: number, memberIdx: number, ip: string) {
        const regdate = getUnixTimeStamp();
        const ymd = getYmd();

        const recent = new CampaignRecent()
        recent.campaignIdx = campaignIdx
        recent.memberIdx = memberIdx
        recent.ip = ip
        recent.regdate = regdate
        recent.ymd = ymd

        return await this.campaignRecentRepository.save(recent)
    }

    create(createCampaignDto: CreateCampaignDto) {
        return 'This action adds a new campaign';
    }

    findAll() {
        return `This action returns all campaign`;
    }

    update(id: number, updateCampaignDto: UpdateCampaignDto) {
        return `This action updates a #${id} campaign`;
    }

    remove(id: number) {
        return `This action removes a #${id} campaign`;
    }
}
