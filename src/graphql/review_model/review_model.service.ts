import {HttpException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CampaignReview} from "../../../entity/entities/CampaignReview";
import {Pagination} from "../../paginate";
import {
    AES_DECRYPT,
    bufferToString,
    FROM_UNIXTIME_JS,
    FROM_UNIXTIME_JS_YY_MM_DD,
    getNow,
    getNowUnix
} from "../../util/common";
import {CommonModelService} from "../common_model/common_model.service";
import {CampaignReviewImage} from "../../../entity/entities/CampaignReviewImage";

@Injectable()
export class ReviewModelService {
    constructor(
        @InjectRepository(CampaignReview)
        private readonly reviewRepository: Repository<CampaignReview>,
        @InjectRepository(CampaignReviewImage)
        private readonly reviewImageRepository: Repository<CampaignReviewImage>,
        private readonly commonModelService: CommonModelService,
    ) {
    }

    async getReviews(idx: number, take: number, page: number) {
        try {
            let data = await this.reviewRepository.createQueryBuilder("campaignReview")
                .leftJoin("campaignReview.member", "member")
                .leftJoin("campaignReview.campaignItem", "campaignItem")
                // .leftJoin('campaignReviewImage', 'campaignReviewImage', 'campaignReviewImage.reviewIdx = campaignReview.idx')
                .select([
                    "campaignReview.idx as idx",
                    "campaignItem.idx as itemIdx",
                    "campaignItem.name as itemName",
                    "campaignReview.memberIdx as memberIdx",
                    "campaignReview.regdate as regdate",
                    "campaignReview.content as content",
                    "campaignReview.content_a as content_a",
                    "campaignReview.rate as rate",
                    "campaignReview.images as images",
                    "campaignReview.aws_use_yn as aws_use_yn",
                    // "campaignReviewImage.key as awsKey",
                    // "campaignReviewImage.url as url",
                ])
                .addSelect(`(${AES_DECRYPT('member.name')})`, 'name')
                .where("campaignReview.campaignIdx = :idx", {idx: idx})
                .orderBy("campaignReview.regdate", "DESC")
                .offset(take * (page - 1))
                .limit(take)
                .getRawMany();
            data = bufferToString(data)

            let total = await this.reviewRepository.createQueryBuilder("campaignReview")
                .select('*')
                .where("campaignReview.campaignIdx = :idx", {idx: idx})
                .getCount();

            let totalPage = Math.ceil(total / take);
            if (page > totalPage) {
                throw new NotFoundException();
            }
            const currentPage = page;

            if (data.length > 0) {
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

                    if (item.aws_use_yn == 'N') {
                        jsonImages.map((image) => {
                            let object = {
                                key: null,
                                url: null
                            };
                            jsonImages.map((image) => {
                                object.url = 'https://wairi.co.kr/img/review/' + image;
                                images.push(object);
                            })
                        })
                    } else {
                        if (jsonImages.length > 0) {
                            jsonImages.map((image) => {
                                images.push(image);
                            })
                        }
                    }
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
                    "campaignReview.regdate_a as regdate_a",
                    "campaignReview.content as content",
                    "campaignReview.content_a as content_a",
                    "campaignReview.rate as rate",
                    "campaignReview.images as images",
                    "campaignReview.aws_use_yn as aws_use_yn",
                ])
                .addSelect(`(${AES_DECRYPT('member.name')})`, 'memberName')
                .where("campaignReview.idx = :idx", {idx: idx})
                .getRawOne();

            data = bufferToString(data)

            if (data.images) {
                let jsonImages = JSON.parse(data.images)
                let images = [];
                //jsonImages.length > 0
                if (data.aws_use_yn == 'N') {
                    if (jsonImages.length > 0) {
                        let object = {
                            key: null,
                            url: null
                        };
                        jsonImages.map((image) => {
                            object.url = 'https://wairi.co.kr/img/review/' + image;
                            images.push(object);
                        })
                    }
                } else {
                    // console.log("=>(review_model.service.ts:158) jsonImages", jsonImages);
                    if (jsonImages.length > 0) {
                        jsonImages.map((image) => {
                            console.log("=>(review_model.service.ts:162) image", image);
                            images.push(image);
                        })

                    }
                    images = jsonImages;
                }
                data.images = images;
            }

            if (data.memberName) {
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

            if (data.content_a) {
                //regdate_a unixtime 날짜 형식 변경 xx년 xx월 xx일
                const date_a = FROM_UNIXTIME_JS_YY_MM_DD(data.regdate_a);
                data.regdate_a = date_a;
            }
            console.log("=>(review_model.service.ts getReview:184) data", data);
            return data;
        } catch (error) {
            console.log("=>(review_model.service.ts:153) error", error);
            throw new HttpException(error.message, error.status);
        }
    }

    async deleteReview(idx: number, memberIdx: number) {
        //transaction start
        const queryRunner = this.reviewRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let data = await this.reviewRepository.createQueryBuilder("campaignReview")
                .leftJoin("campaignReview.member", "member")
                .where("campaignReview.idx = :idx", {idx: idx})
                .andWhere("campaignReview.memberIdx = :memberIdx", {memberIdx: memberIdx})
                .getOne();
            if (!data) {
                throw new HttpException("리뷰가 존재하지 않습니다.", 400);
            }

            //s3 key
            let s3ImageKeys = [];
            await this.reviewImageRepository.createQueryBuilder("campaignReviewImage")
                .select("*")
                .where("reviewIdx = :idx", {idx: idx})
                .getRawMany()
                .then((result) => {
                    result.map((item) => {
                        s3ImageKeys.push(item.awskey);
                    })
                });
            console.log("=>(review_model.service.ts:219) s3ImageKeys", s3ImageKeys);
            //reivew DB 삭제
            await queryRunner.manager.createQueryBuilder()
                .delete()
                .from(CampaignReview)
                .where("idx = :idx", {idx: idx})
                .execute();

            //이미지 DB 삭제
            await queryRunner.manager.createQueryBuilder()
                .delete()
                .from(CampaignReviewImage)
                .where("reviewIdx = :idx", {idx: idx})
                .execute();

            await queryRunner.commitTransaction();

            //s3 이미지 삭제
            for (let i = 0; i < s3ImageKeys.length; i++) {
                await this.commonModelService.deleteImage(s3ImageKeys[i]);
            }

            return {
                status: 200,
                message: "리뷰가 삭제되었습니다."
            }

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(error.message, error.status);
        } finally {
            await queryRunner.release();
        }
    }

    async createReview(s3ObjectData: any[], content: string, campaignIdx: number, itemIdx: number, submitIdx: number, rate: number, idx: number) {
        // transaction start

        //s3ObjectData = [{'key': awsObjectData.key, 'url': awsObjectData.url}] 에서 url 배열로 만듬
        // let images = [];
        // s3ObjectData.map((item) => {
        //     images.push(item.url);
        // })

        const queryRunner = this.reviewRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const now = getNowUnix();
            let data = await queryRunner.manager.createQueryBuilder()
                .insert()
                .into(CampaignReview)
                .values({
                    memberIdx: idx,
                    campaignIdx: campaignIdx,
                    itemIdx: itemIdx,
                    submitIdx: submitIdx,
                    content: content,
                    rate: rate,
                    images: JSON.stringify(s3ObjectData),
                    aws_use_yn: 'Y',
                    regdate: () => `"${now}"`,
                })
                .execute();

            //data insert id
            let insertId = data.identifiers[0].idx;
            if (insertId) {
                //이미지 DB 저장
                if (s3ObjectData.length > 0) {
                    for (let i = 0; i < s3ObjectData.length; i++) {
                        await queryRunner.manager.createQueryBuilder()
                            .insert()
                            .into(CampaignReviewImage, [
                                'reviewIdx', 'awskey', 'url', 'create_at'
                            ])
                            .values({
                                reviewIdx: insertId,
                                awskey: s3ObjectData[i].key,
                                url: s3ObjectData[i].url,
                                create_at: () => `"${getNow()}"`
                            })
                            .execute();
                    }
                }
            }

            await queryRunner.commitTransaction();
            return {
                code: 200,
                message: "리뷰가 등록되었습니다."
            };

        } catch (error) {
            this.removeFiles(s3ObjectData);
            await queryRunner.rollbackTransaction();
            throw new HttpException(error.message, error.status);
        } finally {
            await queryRunner.release();
        }
    }

    async updateReview(idx: number, newImageArray: any[], s3ObjectData: any[], deleteImages: any[], content: string, campaignIdx: number, itemIdx: number, submitIdx: number, rate: number, memberIdx: number) {
        const queryRunner = this.reviewRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            //리뷰 업데이트
            await queryRunner.manager.createQueryBuilder()
                .update(CampaignReview)
                .set({
                    content: content,
                    rate: rate,
                    images: JSON.stringify(newImageArray),
                    aws_use_yn: 'Y',
                })
                .where("idx = :idx", {idx: idx})
                .andWhere("memberIdx = :memberIdx", {memberIdx: memberIdx})
                .execute();

            //이미지 DB 저장
            for (let i = 0; i < s3ObjectData.length; i++) {
                await queryRunner.manager.createQueryBuilder()
                    .insert()
                    .into(CampaignReviewImage, [
                        'reviewIdx', 'awskey', 'url', 'create_at'
                    ])
                    .values({
                        reviewIdx: idx,
                        awskey: s3ObjectData[i].key,
                        url: s3ObjectData[i].url,
                        create_at: () => `"${getNow()}"`
                    })
                    .execute();
            }
            //이미지 DB 삭제
            let keys = [];
            for (let i = 0; i < deleteImages.length; i++) {
                //deleteImages url 일치하는 key 찾기
                // await this.reviewImageRepository.createQueryBuilder("campaignReviewImage")
                //     .select("*")
                //     .where("url = :url", {url: deleteImages[i].url})
                //     .getRawMany()
                //     .then((result) => {
                //         result.map((item) => {
                //             keys.push(item.key);
                //         })
                //     });
                await queryRunner.manager.createQueryBuilder()
                    .delete()
                    .from(CampaignReviewImage)
                    .where("awskey = :awskey", {awskey: deleteImages[i]})
                    .execute();
            }

            await queryRunner.commitTransaction();

            //s3 이미지 삭제
            for (let i = 0; i < keys.length; i++) {
                await this.commonModelService.deleteImage(keys[i]);
            }

            return {
                code: 200,
                message: "리뷰가 수정되었습니다."
            };

        } catch (error) {
            this.removeFiles(s3ObjectData);
            await queryRunner.rollbackTransaction();
            throw new HttpException(error.message, error.status);
        } finally {
            await queryRunner.release();
        }
    }

    private removeFiles(s3ObjectData: any[]) {
        for (let i = 0; i < s3ObjectData.length; i++) {
            this.commonModelService.deleteImage(s3ObjectData[i].key);
        }
    }

    async getMyReviews(memberIdx: number, take: number, page: number) {
        try {
            let data = await this.reviewRepository.createQueryBuilder("campaignReview")
                .leftJoin("campaignReview.member", "member")
                .leftJoin("campaignReview.campaignItem", "campaignItem")
                .leftJoin("campaignReview.campaign", "campaign")
                // .leftJoin('campaignReviewImage', 'campaignReviewImage', 'campaignReviewImage.reviewIdx = campaignReview.idx')
                .select([
                    "campaignReview.idx as idx",
                    "campaignReview.submitIdx as submitIdx",
                    "campaign.idx as campaignIdx",
                    "campaign.name as campaignName",
                    "campaignItem.idx as itemIdx",
                    "campaignItem.name as itemName",
                    "member.idx as memberIdx",
                    "campaignReview.regdate as regdate",
                    "campaignReview.content as content",
                    "campaignReview.content_a as content_a",
                    "campaignReview.rate as rate",
                    "campaignReview.images as images",
                    // "campaignReviewImage.key as awsKey",
                    // "campaignReviewImage.url as url",
                ])
                .addSelect(`(${AES_DECRYPT('member.name')})`, 'name')
                .where("campaignReview.memberIdx = :idx", {idx: memberIdx})
                .orderBy("campaignReview.regdate", "DESC")
                .offset(take * (page - 1))
                .limit(take)
                .getRawMany();
            data = bufferToString(data)

            let total = await this.reviewRepository.createQueryBuilder("campaignReview")
                .select('*')
                .where("campaignReview.memberIdx = :idx", {idx: memberIdx})
                .getCount();

            let totalPage = Math.ceil(total / take);
            if (page > totalPage) {
                throw new NotFoundException();
            }
            const currentPage = page;

            if (data.length > 0) {
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
                    // console.log("=>(review_model.service.ts:455) jsonImages", jsonImages);
                    let images = [];
                    if (item.aws_use_yn == 'N') {
                        if (jsonImages.length > 0) {
                            let object = {
                                key: null,
                                url: null
                            };
                            jsonImages.map((image) => {
                                object.url = 'https://wairi.co.kr/img/review/' + image;
                                images.push(object);
                            })
                        }
                    } else {
                        if (jsonImages.length > 0) {
                            jsonImages.map((image) => {
                                images.push(image);
                            })
                        }
                    }
                    item.images = images;
                })
            }
            // console.log("=>(review_model.service.ts:477) data", data);
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
