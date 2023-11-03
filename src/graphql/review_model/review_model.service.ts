import {HttpException, Injectable, NotFoundException} from '@nestjs/common';
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

    async getReview(idx: number) {
        try{
            let data = await this.reviewRepository.createQueryBuilder("campaignReview")
                .leftJoin("campaignReview.member", "member")
                .leftJoin("campaignReview.campaignItem", "campaignItem")
                .select([
                    "campaignReview.idx as idx",
                    "campaignItem.idx as itemIdx",
                    "campaignItem.name as itemName",
                    "member.idx as memberIdx",
                    "campaignReview.regdate as regdate",
                    "campaignReview.regdate_a as regdate_a",
                    "campaignReview.content as content",
                    "campaignReview.content_a as content_a",
                    "campaignReview.rate as rate",
                    "campaignReview.images as images",
                ])
                .addSelect(`(${AES_DECRYPT('member.name')})`, 'memberName')
                .where("campaignReview.idx = :idx", {idx: idx})
                .getRawOne();

            if(data.images){
                let jsonImages = JSON.parse(data.images);
                let images = [];
                jsonImages.map((image) => {
                    //파일주소에 "https://wairi.s3.ap-northeast-2.amazonaws.com/" 포함되어있는지 체크
                    if(image.indexOf("https://wairi.s3.ap-northeast-2.amazonaws.com/") === -1){
                        images.push('https://wairi.co.kr/img/review/'+image);
                    }else{
                        images.push(image);
                    }
                })
                data.images = images;
            }

            if(data.memberName){
                //data name null 이면  전체 * 로 변경 3글자면 2번째 글자 *로 변경 4글자면 2,3번째 글자 *로 변경
                if (data.memberName === null) {
                    data.memberName = '***';
                } else if (data.memberName.length === 3) {
                    data.memberName = data.memberName.replace(data.memberName.substring(1, 2), '*');
                } else if (data.memberName.length === 4) {
                    data.memberName = data.memberName.replace(data.memberName.substring(1, 3), '**');
                }
            }

            //regdate unixtime 날짜 형식 변경 xx년 xx월 xx일
            const date = FROM_UNIXTIME_JS_YY_MM_DD(data.regdate);
            data.regdate = date;

            if(data.content_a){
                //regdate_a unixtime 날짜 형식 변경 xx년 xx월 xx일
                const date_a = FROM_UNIXTIME_JS_YY_MM_DD(data.regdate_a);
                data.regdate_a = date_a;
            }
            return data;
        }catch (error) {
            console.log(error)
            throw error;
        }
    }

    async deleteReview(idx: number, memberIdx: number) {
        try{
            let data = await this.reviewRepository.createQueryBuilder("campaignReview")
                .leftJoin("campaignReview.member", "member")
                .where("campaignReview.idx = :idx", {idx: idx})
                .andWhere("campaignReview.memberIdx = :memberIdx", {memberIdx: memberIdx})
                .getOne();

            if(data){
                await this.reviewRepository.delete(idx);
                return {
                    status : 200,
                    message : "리뷰가 삭제되었습니다."
                };
            }else{
                return {
                    status : 400,
                    message : "리뷰가 존재하지 않습니다."
                };
            }
        }catch(error){
            console.log(error)
            throw new HttpException(error.message, error.status);
        }
    }
}
