import {Resolver, Query, Args, Mutation} from '@nestjs/graphql';
import {ReviewModelService} from './review_model.service';
import {CommonModelService} from "../common_model/common_model.service";
import {HttpException, UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {AuthUser} from "../../auth/auth-user.decorator";
import {Member} from "../../../entity/entities/Member";
import * as GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import * as Upload from "graphql-upload/Upload.js";
import {FileUpload} from "graphql-upload/Upload";


class CreateReviewInput {
    content: string;
    campaignIdx: number;
    itemIdx: number;
    submitIdx: number;
    rate: number;
    images: any;
}

class UpdateReviewInput {
    idx: number;
    content: string;
    campaignIdx: number;
    itemIdx: number;
    submitIdx: number;
    rate: number;
    images: any;
    deleteImages: any;
}

@Resolver('ReviewModel')
export class ReviewModelResolver {
    constructor(
        private readonly reviewModelService: ReviewModelService,
        private readonly commonModelService: CommonModelService,
    ) {
    }

    @Query()
    async getReviews(
        @Args('idx') idx: number,
        @Args('take') take: number,
        @Args('page') page: number,
    ) {
        try {
            let data = await this.reviewModelService.getReviews(idx, take, page);
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    @Query()
    async getReview(
        @Args('idx') idx: number,
    ) {
        try {
            console.log("=>(review_model.resolver.ts:28) idx", idx);
            let data = await this.reviewModelService.getReview(idx);
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getMyReviews(
        @AuthUser() authUser: Member,
        @Args('take') take: number,
        @Args('page') page: number,
    ) {
        try {
            let data = await this.reviewModelService.getMyReviews(authUser.idx, take, page);
            console.log("=>(review_model.resolver.ts:60) data", data);
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async createReview(
        @AuthUser() authUser: Member,
        @Args('createReviewInput') createReviewInput: CreateReviewInput,
    ) {
        try {
            let s3ObjectData = JSON.parse(createReviewInput.images);
            console.log("=>(review_model.resolver.ts:95) s3ObjectData", s3ObjectData);

            return await this.reviewModelService.createReview(s3ObjectData,
                createReviewInput.content,
                createReviewInput.campaignIdx,
                createReviewInput.itemIdx,
                createReviewInput.submitIdx,
                createReviewInput.rate,
                authUser.idx);
        } catch (error) {
            console.log("=>(review_model.resolver.ts:86) error", error);
            throw new HttpException(error.message, 500)
        }
    }

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async updateReview(
        @AuthUser() authUser: Member,
        @Args('updateReviewInput') updateReviewInput: UpdateReviewInput,
    ) {
        try {
            let review = await this.reviewModelService.getReview(updateReviewInput.idx);

            if (!review) {
                throw new HttpException("리뷰가 존재하지 않습니다.", 404);
            }

            if (review.memberIdx !== authUser.idx) {
                throw new HttpException("권한이 없습니다.", 401);
            }

            let s3ObjectData = JSON.parse(updateReviewInput.images);

            // review의 images와 images를 비교하여 삭제할 이미지를 찾음
            let deleteImages = [];
            if(updateReviewInput.deleteImages){
                deleteImages = updateReviewInput.deleteImages.split(',');
                console.log("=>(review_model.resolver.ts:132) deleteImages", deleteImages);
            }
            //updateReview 실행
            return await this.reviewModelService.updateReview(
                updateReviewInput.idx,
                s3ObjectData,
                s3ObjectData,
                deleteImages,
                updateReviewInput.content,
                updateReviewInput.campaignIdx,
                updateReviewInput.itemIdx,
                updateReviewInput.submitIdx,
                updateReviewInput.rate,
                authUser.idx);

        }catch (error) {
            console.log("=>(review_model.resolver.ts:107) error", error);
            throw new HttpException(error.message, 500)
        }
    }

    // @Mutation()
    // @UseGuards(GqlAuthGuard)
    // async createReview(
    //     @AuthUser() authUser: Member,
    //     //files 가 존재할지 안할지 모르기 때문에 ?로 설정
    //
    //     @Args({name: 'files', type: () => [GraphQLUpload], nullable: true}) files:  Upload[],
    //     @Args('content') content: string,
    //     @Args('campaignIdx') campaignIdx: number,
    //     @Args('itemIdx') itemIdx: number,
    //     @Args('submitIdx') submitIdx: number,
    //     @Args('rate') rate: number,
    // ){
    //     try {
    //         let file:Upload[] = files;
    //         //  let test = await file;
    //         //  console.log("=>(review_model.resolver.ts:84) file", file);
    //         // return {
    //         //     file : test
    //         // }
    //         console.log("=>(review_model.resolver.ts:89) file.length", file);
    //         //다중 파일 업로드
    //         let s3ObjectData = [];
    //
    //         if (file && file.length > 0) {
    //             for(let i=0; i<file.length; i++) {
    //                 console.log("=>(review_model.resolver.ts:85) file", file);
    //                 let awsObjectData = await this.commonModelService.uploadImage(await file[i].file);
    //                 s3ObjectData.push(
    //                     {'key': awsObjectData.key, 'url': awsObjectData.url})
    //             }
    //             console.log("=>(review_model.resolver.ts:78) s3ObjectData", s3ObjectData);
    //
    //             return await this.reviewModelService.createReview(s3ObjectData, content, campaignIdx, itemIdx, submitIdx, rate, authUser.idx);
    //         }else{
    //             return await this.reviewModelService.createReview([], content, campaignIdx, itemIdx, submitIdx, rate, authUser.idx);
    //         }
    //     } catch (error) {
    //         console.log("=>(review_model.resolver.ts:86) error", error);
    //         throw new HttpException(error.message, 500)
    //     }
    // }

    // @Mutation()
    // @UseGuards(GqlAuthGuard)
    // async updateReview(
    //     @Args('idx') idx: number,
    //     @Args('images') images: string,
    //     @Args({name: 'files', type: () => [GraphQLUpload]}) files: Upload[],
    //     @Args('content') content: string,
    //     @Args('campaignIdx') campaignIdx: number,
    //     @Args('itemIdx') itemIdx: number,
    //     @Args('submitIdx') submitIdx: number,
    //     @Args('rate') rate: number,
    //     @AuthUser() authUser: Member
    // ) {
    //     let file: Upload[] = files;
    //
    //     //REVIEW UPDATE IMAGES DELETE
    //
    //     // idx로 review 조회
    //     let review = await this.reviewModelService.getReview(idx);
    //
    //     if (review.memberIdx !== authUser.idx) {
    //         throw new HttpException("권한이 없습니다.", 401);
    //     }
    //     if (!review) {
    //         throw new HttpException("리뷰가 존재하지 않습니다.", 404);
    //     }
    //
    //     // review의 images를 가져옴
    //     let reviewImages = review.images;
    //     console.log("=>(review_model.resolver.ts:114) reviewImages", reviewImages);
    //     // review의 images와 images를 비교하여 삭제할 이미지를 찾음
    //     let deleteImages = reviewImages.filter(reviewImage => !images.includes(reviewImage));
    //     console.log("=>(review_model.resolver.ts:117) deleteImages", deleteImages);
    //     console.log("=>(review_model.resolver.ts:117) deleteImages", typeof (deleteImages));
    //
    //     try {
    //         //다중 파일 업로드
    //         let s3ObjectData = [];
    //         if (file.length > 0) {
    //             for (let i = 0; i < file.length; i++) {
    //                 let awsObjectData = await this.commonModelService.uploadImage(await file[i].file);
    //                 s3ObjectData.push(
    //                     {'key': awsObjectData.key, 'url': awsObjectData.url})
    //             }
    //         }
    //         //, 구분으로 배열 생성
    //         let newImageArray = images.split(',');
    //
    //         //s3ObjectData가 있을 경우 url만 newImageArray 추가
    //         if (s3ObjectData.length > 0) {
    //             s3ObjectData.forEach((s3ObjectData) => {
    //                 newImageArray.push(s3ObjectData.url);
    //             })
    //         }
    //
    //         console.log("=>(review_model.resolver.ts:142) newImageArray", newImageArray);
    //
    //         //updateReview 실행
    //         let data = await this.reviewModelService.updateReview(idx, newImageArray, s3ObjectData, deleteImages,
    //             content, campaignIdx, itemIdx, submitIdx, rate, authUser.idx);
    //
    //     } catch (error) {
    //         console.log("=>(review_model.resolver.ts:146) updateReview error", error);
    //         throw new HttpException(error.message, 500)
    //     }
    // }

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async deleteReview(
        @Args('idx') idx: number,
        @AuthUser() authUser: Member
    ) {
        try {
            let data = await this.reviewModelService.deleteReview(idx, authUser.idx);
            return data;
        } catch (error) {
            console.log("=>(review_model.resolver.ts:100) error", error);
            throw new HttpException(error.message, 500)
        }
    }

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async deleteImage() {
        try {
            let data = await this.commonModelService.deleteImage('test');
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
}
