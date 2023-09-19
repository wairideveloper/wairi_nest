import {Args, Int, Query, Resolver} from '@nestjs/graphql';
import {CampaignService} from "../../campaign/campaign.service";
import {UseGuards, Req} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {bufferToString} from "../../util/common";
import {FetchPaginationInput} from "../../members/dto/fetch-pagination.input";
import * as process from 'process';
import {JwtService} from "@nestjs/jwt";

@Resolver('Campaign')
export class CampaignResolver {
    constructor(private readonly campaignsService: CampaignService) {
    }

    @Query()
    async search(@Args('keyword', {type: () => String}) keyword: string) {
        try {
            let data = await this.campaignsService.search(keyword);
            //json 형식으로 변환

            console.log(data)
            // console.log(bufferToString(data))
            // data.forEach((element) => {
            //     bufferToString(element);
            // });
            return data
        } catch (error) {
            console.log(error)
            throw error;
        }
    }


    @Query()
    @UseGuards(GqlAuthGuard)
    async getCampaign(@Args('id', {type: () => Int}) id: number) {
        try {
            let data = await this.campaignsService.findOne(id);
            //json 형식으로 변환

            console.log(data)
            // console.log(bufferToString(data))
            // data.forEach((element) => {
            //     bufferToString(element);
            // });
            return data
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getCampaigns(@Args('take', {type: () => Int}) take: number,
                       @Args('page', {type: () => Int}) page: number) {
        try {
            console.log(take, page)
            const list = await this.campaignsService.mainList({take, page});
            //json 형식으로 변환

            console.log(list)
            // console.log(bufferToString(data))
            // data.forEach((element) => {
            //     bufferToString(element);
            // });
            return list
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
    @Query()
    async getDetailCampaign(@Args('idx', {type: () => Int}) idx: number) {
        try {
            console.log(idx)
            let data = await this.campaignsService.findOne(idx);
            //json 형식으로 변환
            console.log(data)
            return data
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getMember(@Args('id', {type: () => Int}) id: number) {
        try {

        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getMemberByEmail(@Args('email', {type: () => String}) email: string) {
        try {

        } catch (error) {
            console.log(error)
            throw error;
        }
    }


}
