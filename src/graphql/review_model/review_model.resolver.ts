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

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async createReview(
        @AuthUser() authUser: Member,
        @Args({name: 'files', type: () => [GraphQLUpload]}) files:  Upload[],
        @Args('content') content: string,
        @Args('campaignIdx') campaignIdx: number,
        @Args('itemIdx') itemIdx: number,
        @Args('submitIdx') submitIdx: number,
        @Args('rate') rate: number,
    ){
        try {
            let file:Upload[] = files;
            //단일 파일 업로드
            if (file.length === 1) {
                // console.log("=>(review_model.resolver.ts:60) file[0].file", file[0].file);
                // let imgUrl = await this.commonModelService.uploadImage(file[0].file);
                // console.log("=>(review_model.resolver.ts:55) imgUrl", imgUrl);
            }
            //다중 파일 업로드
            if (file.length > 1) {
                let s3ObjectData = [];
                for(let i=0; i<file.length; i++) {
                    console.log("=>(review_model.resolver.ts:59) file", await file[i]);
                    let awsObjectData = await this.commonModelService.uploadImage(await file[i].file);
                    s3ObjectData.push(
                        {'key': awsObjectData.key, 'url': awsObjectData.url})
                }
                console.log("=>(review_model.resolver.ts:78) s3ObjectData", s3ObjectData);
                console.log("=>(review_model.resolver.ts:61) content", content);

                await this.reviewModelService.createReview(s3ObjectData, content, campaignIdx, itemIdx, submitIdx, rate, authUser.idx);
            }
        } catch (error) {
            console.log("=>(review_model.resolver.ts:86) error", error);
            throw new HttpException(error.message, 500)
        }
    }

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
