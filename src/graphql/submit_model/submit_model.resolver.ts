import {Args, Mutation, Resolver} from '@nestjs/graphql';
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
    type: number;
    submitChannel: number;
    subContent2: string;
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
        let checked = true;
        let sid = 0;
        while (checked) {
            let sid = genSid(createCampaignSubmitInput.itemIdx)
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

        let inputData = {
            campaignIdx: createCampaignSubmitInput.campaignIdx,
            itemIdx: createCampaignSubmitInput.itemIdx,
            nop: createCampaignSubmitInput.nop,
            startDate: startDate,
            endDate: endDate,
            price: createCampaignSubmitInput.price,
            type: createCampaignSubmitInput.type,
            submitChannel: createCampaignSubmitInput.submitChannel,
            subContent: createCampaignSubmitInput.subContent2,
            memberIdx: authUser.idx,
            regdate : getUnixTimeStamp(),
            autoCancelDate: getUnixTimeStampAfter3Days(), // 3일 후 자동 취소
            campaignName: campaign.name,
            itemName: campaignItem.name,
        }
        console.log('==========> 🤩 : ' + inputData);
        console.log(inputData);
        return inputData;

        let data = await this.submitModelService.createCampaignSubmit(inputData);
        console.log("=>(submit_model.resolver.ts:41) data", data);
        return data;
    }
}
