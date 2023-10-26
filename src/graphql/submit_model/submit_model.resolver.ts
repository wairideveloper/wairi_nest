import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import {SubmitModelService} from './submit_model.service';
import {UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {AuthUser} from "../../auth/auth-user.decorator";
import {Member} from "../../../entity/entities/Member";
import {
    _getChannelName,
    genSid,
    getUnixTimeStamp,
    getUnixTimeStampAfter3Days,
    getUnixTimeStampByDate
} from "../../util/common";
import {CampaignService} from "../../campaign/campaign.service";

class CreateCampaignSubmitInput {
    campaignIdx: number;
    itemIdx: number;
    nop: number;
    startDate: string;
    endDate: string;
    price: number;
    // type: number;
    submitChannel: number;
    subContent2: string;
    agreeContent: string;
}

@Resolver('SubmitModel')
export class SubmitModelResolver {
    constructor(
        private readonly submitModelService: SubmitModelService,
        private readonly campaignsService: CampaignService
    ) {
    }

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async createCampaignSubmit(
        @Args('createCampaignSubmitInput') createCampaignSubmitInput: CreateCampaignSubmitInput,
        @AuthUser() authUser: Member,
    ) {
        try{
            let checked = true;
            let sid = "";
            while (checked) {
                sid = genSid(createCampaignSubmitInput.itemIdx)
                const checkSid = await this.submitModelService.checkSid(sid)
                if (checkSid === 0) {
                    checked = false;
                }
            }
            const campaign = await this.campaignsService.getCampaign(createCampaignSubmitInput.campaignIdx);
            const campaignItem = await this.campaignsService.getCampaignItemByIdx(createCampaignSubmitInput.itemIdx);

            console.log("=>(submit_model.resolver.ts:56) campaignItem", campaignItem.calcType1);
            console.log("=>(submit_model.resolver.ts:56) campaignItem", campaignItem.calcType2);

            //일자별
            campaignItem.channelNames = _getChannelName(campaignItem.channels);

            const startDate = getUnixTimeStampByDate(createCampaignSubmitInput.startDate);
            const endDate = getUnixTimeStampByDate(createCampaignSubmitInput.endDate);
            const pay = campaignItem.priceOrig * (campaignItem.dc11/100) * createCampaignSubmitInput.nop;

            //createCampaignSubmitInput.endDate - createCampaignSubmitInput.startDate
            const nights = (endDate - startDate) / 86400;
            console.log("=>(submit_model.resolver.ts:68) nights", nights);

            let inputData = {
                sid: sid,
                status: 100,
                memberType: 1,
                memberType2: 1,
                nights: nights,
                campaignIdx: createCampaignSubmitInput.campaignIdx,
                itemIdx: createCampaignSubmitInput.itemIdx,
                nop: createCampaignSubmitInput.nop,
                startDate: startDate,
                endDate: endDate,
                price: createCampaignSubmitInput.price,
                // type: createCampaignSubmitInput.type,
                submitChannel: createCampaignSubmitInput.submitChannel,
                subContent2: createCampaignSubmitInput.subContent2,
                memberIdx: authUser.idx,
                regdate : getUnixTimeStamp(),
                autoCancelDate: getUnixTimeStampAfter3Days(), // 3일 후 자동 취소
                campaignName: campaign.name,
                itemName: campaignItem.name,
                payItem: pay,
                payTotal: pay,
                agreeContent: createCampaignSubmitInput.agreeContent,
            }

            console.log('==========> 🤩 : ' + inputData);

            let data = await this.submitModelService.createCampaignSubmit(inputData);
            console.log("=>(submit_model.resolver.ts:99) data", data);

            if(data) {
                return {
                    code: 200,
                    message: 'success',
                    data: {
                        sid: sid
                    }
                }
            } else {
                return {
                    code: 400,
                    message: 'fail',
                    data: null
                }
            }
        } catch (error) {
            console.log("=>(submit_model.resolver.ts:56) error", error)
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getSubmitList(
        @Args('take') take: number,
        @Args('page') page: number,
        @AuthUser() authUser: Member,
    ){
        try{
            let data = await this.submitModelService.getSubmitList(11242, take, page);
            return data;
        }catch(error){
            console.log(error)
            throw error;
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getSubmitDetail(
        @Args('sid') sid: string,
        @Args('reason') reason: string,
        @AuthUser() authUser: Member,
    ){
        try{
            let data = await this.submitModelService.getSubmitDetail(sid, 11242);
            return data;
        }catch (error) {
            console.log(error)
            throw error;
        }
    }

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async cancellationRequest(
        @Args('sid') sid: string,
        @Args('reason') reason: string,
        @AuthUser() authUser: Member,
    ){
        try{
            let data = await this.submitModelService.cancellationRequest(sid, 11242, reason);
            if (data) {
                return {
                    code: 200,
                    message: 'success',
                    data: null
                }
            } else {
                return {
                    code: 400,
                    message: 'fail',
                    data: null
                }
            }
        }catch (error) {
            console.log(error)
            throw error;
        }
    }
}
