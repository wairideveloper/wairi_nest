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
        @Args({name: 'files', type: () => [GraphQLUpload]}) files:  FileUpload[],
    ){
        try {
            let file:FileUpload[] = files;
            console.log("=>(review_model.resolver.ts:59) file", file[0]);
            console.log("=>(review_model.resolver.ts:59) file", await file[1]);




            //단일 파일 업로드
            if (file.length === 1) {
                // console.log("=>(review_model.resolver.ts:60) file[0].file", file[0].file);
                // let imgUrl = await this.commonModelService.uploadImage(file[0].file);
                // console.log("=>(review_model.resolver.ts:55) imgUrl", imgUrl);
            }

            //다중 파일 업로드
            if (file.length > 1) {
                let keys = [];
                let urls = [];

                await Promise.allSettled(file.map(async (  item, index) => {
                    // let awsObjectData = await this.commonModelService.uploadImage(item.file);
                    // urls.push(awsObjectData.url);
                    // keys.push(awsObjectData.key);
                }));
                // console.log("=>(review_model.resolver.ts:79) urls", urls);
                // console.log("=>(review_model.resolver.ts:80) keys", keys);
                // console.log("=>(review_model.resolver.ts:80) result", result);

                // let data = await this.reviewModelService.createReview(authUser.idx, keys, urls);
                // return data;
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
