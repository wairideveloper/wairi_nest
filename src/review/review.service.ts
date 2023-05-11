import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateReviewDto} from './dto/create-review.dto';
import {UpdateReviewDto} from './dto/update-review.dto';
import {CampaignReview} from "../../entity/entities/CampaignReview";
import {InjectRepository} from "@nestjs/typeorm";
import {AES_DECRYPT, getImgPath, getMaskingName} from "../util/common";
import {Repository} from "typeorm";
import * as moment from "moment/moment";
import * as fs from "fs";

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(CampaignReview)
        private reviewRepository: Repository<CampaignReview>
    ) {
    }

    async create(content, files, memberIdx, campaignIdx, itemIdx, submitIdx, rate) {

        let fileArray = []
        files.map((file) => {
            // fileArray.push(getImgPath('review',file.filename))
            fileArray.push(file.filename)
        })
        const fileString = JSON.stringify(fileArray)

        const review = new CampaignReview()
        review.content = content
        review.images = fileString
        review.memberIdx = memberIdx
        review.campaignIdx = campaignIdx
        review.itemIdx = itemIdx
        review.submitIdx = submitIdx
        review.rate = rate
        return await this.reviewRepository.save(review)
    }

    async findAll(id) {
        const data = await this.reviewRepository.createQueryBuilder("review")
            .leftJoin("review.member", "member")
            .leftJoin('review.campaign', 'campaign')
            .leftJoin('review.campaignItem', 'campaignItem')
            .select(
                [
                    "campaign.idx as campaignIdx",
                    "campaign.name as campaignName",
                    "campaignItem.name as campaignItemName",
                    "review.idx as idx",
                    "review.content as content",
                    "review.images as images",
                    "review.regdate as regdate",
                    "review.rate as rate",
                ]
            )
            .addSelect(`(${AES_DECRYPT('member.name')})`, 'name')
            .where("review.campaignIdx = :id", {id: id})
            .orderBy("review.idx", "DESC")
            .getRawMany()

        data.map((item) => {
            item.images = JSON.parse(item.images)
            item.regdate = moment.unix(item.regdate).format('YYYY-MM-DD');
            item.name = getMaskingName(item.name)
        })
        return data
    }

    async findOne(id: number) {
        const data = await this.reviewRepository.findOne({where: {idx: id}});
        data.images = JSON.parse(data.images)
        data.regdate = moment.unix(Number(data.regdate)).format('YYYY-MM-DD');
        return data
    }

    async update(id: number, content, files, memberIdx, campaignIdx, itemIdx, submitIdx, rate) {
        //수정 권한 체크 (작성자 체크)
        const check = await this.checkWriter(id, memberIdx)

        if (check) {
            const review = check

            review.content = content
            if(files.length > 0) {
                let fileArray = []
                files.map((file) => {
                    fileArray.push(file.filename)
                })
                const fileString = JSON.stringify(fileArray)
                review.images = fileString
            }
            review.memberIdx = memberIdx
            review.campaignIdx = campaignIdx
            review.itemIdx = itemIdx
            review.submitIdx = submitIdx
            review.rate = rate
            return await this.reviewRepository.save(review)
        }else{
            return '권한이 없습니다.'
        }
    }

    async remove(id: number, memberIdx) {
        //삭제 권한 체크 (작성자 체크)
        const check = await this.checkWriter(id, memberIdx)

        if (check) {
            const images = JSON.parse(check.images)
            images.map((item) => {
                //파일 존재여부 체크
                if (fs.existsSync(`./uploads/review/${item}`)) {
                    fs.unlinkSync(`./uploads/review/${item}`)
                }
            })
            return this.reviewRepository.delete({idx: id})
        } else {
            return '권한이 없습니다.'
        }
    }

    //작성자 체크
    async checkWriter(id, memberIdx) {
        const review = await this.reviewRepository.findOne({where: {idx: id}});
        if(review)
        {
            if (review.memberIdx === Number(memberIdx)) {
                return review
            } else {
                return false
            }
        }else {
            throw new NotFoundException(`Review with id ${id} not found`);
        }
    }
}
