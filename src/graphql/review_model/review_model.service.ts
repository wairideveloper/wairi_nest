import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignReview} from "../../../entity/entities/CampaignReview";
import {Pagination} from "../../paginate";
import {AES_DECRYPT, FROM_UNIXTIME_JS, FROM_UNIXTIME_JS_YY_MM_DD} from "../../util/common";
import moment from "moment";

@Injectable()
export class ReviewModelService {
    constructor(
        @InjectRepository(CampaignReview)
        private readonly reviewRepository: Repository<CampaignReview>,
    ) {
    }
    async getReviews(idx: number, take: number, page: number) {
        try {
            let data = await this.reviewRepository.createQueryBuilder("campaignReview")
                .leftJoin("campaignReview.member", "member")
                .leftJoin("campaignReview.campaignItem", "campaignItem")
                .select([
                    "campaignReview.idx as idx",
                    "campaignItem.idx as itemIdx",
                    "campaignItem.name as itemName",
                    "member.idx as memberIdx",
                    "campaignReview.regdate as regdate",
                    "campaignReview.content as content",
                    "campaignReview.content_a as content_a",
                    "campaignReview.rate as rate",
                    "campaignReview.images as images",
                ])
                .addSelect(`(${AES_DECRYPT('member.name')})`, 'name')
                .where("campaignReview.campaignIdx = :idx", {idx: idx})
                .orderBy("campaignReview.regdate", "DESC")
                .offset(take * (page - 1))
                .limit(take)
                .getRawMany();

            let total = await this.reviewRepository.createQueryBuilder("campaignReview")
                .select('*')
                .where("campaignReview.campaignIdx = :idx", {idx: idx})
                .getCount();

            let totalPage = Math.ceil(total / take);
            if (page > totalPage) {
                throw new NotFoundException();
            }
            const currentPage = page;

            if(data.length > 0) {
                //data name null 이면  전체 * 로 변경 3글자면 2번째 글자 *로 변경 4글자면 2,3번째 글자 *로 변경
                data.map((item) => {
                    if (item.name === null) {
                        item.name = '***';
                    } else if (item.name.length === 3) {
                        item.name = item.name.replace(item.name.substring(1, 2), '*');
                    } else if (item.name.length === 4) {
                        item.name = item.name.replace(item.name.substring(1, 3), '**');
                    }

                    //regdate unixtime 날짜 형식 변경 xx년 xx월 xx일
                    const date = FROM_UNIXTIME_JS_YY_MM_DD(item.regdate);
                    item.regdate = date;

                    //images
                    let jsonImages = JSON.parse(item.images);
                    let images = [];
                    jsonImages.map((image) => {
                        //파일주소에 "https://wairi.s3.ap-northeast-2.amazonaws.com/" 포함되어있는지 체크
                        if(image.indexOf("https://wairi.s3.ap-northeast-2.amazonaws.com/") === -1){
                            images.push('https://wairi.co.kr/img/review/'+image);
                        }else{
                            images.push(image);
                        }
                    })
                    item.images = images;
                })
            }

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
}
