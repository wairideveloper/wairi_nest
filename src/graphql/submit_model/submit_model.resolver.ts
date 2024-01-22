import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import {SubmitModelService} from './submit_model.service';
import {HttpException, UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {AuthUser} from "../../auth/auth-user.decorator";
import {Member} from "../../../entity/entities/Member";
import {
    _getChannelName, bufferToString, FROM_UNIXTIME_JS_PLUS,
    genSid, getAfter3Days, getChannelName,
    getUnixTimeStamp,
    getUnixTimeStampAfter3Days,
    getUnixTimeStampByDate, getUnixTimeStampByDate9Sub
} from "../../util/common";
import {CampaignService} from "../../campaign/campaign.service";
import {Madein20ModelService} from "../madein20_model/madein20_model.service";
import {MembersService} from "../member_model/member.service";
import {ApiplexService} from "../apiplex/apiplex.service";

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
    agreeContent: number;
}

class DraftRegistrationInput {
    sid: string;
    postRemarks: string;
}

class DraftCompleteInput {
    sid: string;
    url: string;
}

@Resolver('SubmitModel')
export class SubmitModelResolver {
    constructor(
        private readonly submitModelService: SubmitModelService,
        private readonly campaignsService: CampaignService,
        private readonly madein20ModelService: Madein20ModelService,
        private readonly membersService: MembersService,
        private readonly apiPlexService: ApiplexService,
    ) {
    }


    //  campaignIdx: number;
    //     itemIdx: number;
    //     nop: number;
    //     startDate: string;
    //     endDate: string;
    //     price: number;
    //     // type: number;
    //     submitChannel: number;
    //     subContent2: string;
    //     agreeContent: string;
    @Mutation()
    @UseGuards(GqlAuthGuard)
    async createCampaignSubmit(
        @Args('createCampaignSubmitInput') createCampaignSubmitInput: CreateCampaignSubmitInput,
        @AuthUser() authUser: Member,
    ) {
        try {
            const campaign = await this.campaignsService.getCampaign(createCampaignSubmitInput.campaignIdx);
            const campaignItem = await this.campaignsService.getCampaignItemByIdx(createCampaignSubmitInput.itemIdx);

            //Todo 수익분배 월별 제한인원 신청하기 전에 체크
            if(campaignItem.sellType == 3){
                //신청 시작일 기준  년 가져오기
                let year = createCampaignSubmitInput.startDate.split('-')[0];
                //신청 시작일 기준  월 가져오기
                let month = createCampaignSubmitInput.startDate.split('-')[1];
                //$month 월의 첫날 Y-m-d 00:00:00 가져와서 타임으로 변환
                let startDate = getUnixTimeStampByDate9Sub(`${year}-${month}-01 00:00:00`);

                //해당월의 마지막날 찾기 asia/seoul
                let lastDay = new Date(Number(year), Number(month), 0);

                //$month 월의 lastDay Y-m-d 00:00:00 가져와서 타임으로 변환
                let endDate = getUnixTimeStampByDate9Sub(`${year}-${month}-${lastDay.getDate()} 00:00:00`);

                let check = await this.submitModelService.checkSubmitLimitMonth(campaignItem.idx, startDate, endDate);
                console.log("=>(submit_model.resolver.ts:93) 월별 제한인원 체크 : ", check);
                if(check >= campaignItem.profit_distribution){
                    return {
                        code: 400,
                        message: '해당 캠페인은 월별 제한인원을 초과하였습니다.',
                        data: null
                    }
                }
            }

            console.log("=>(submit_model.resolver.ts:59) 신청하기 ", '신청하기 시작' );
            let checked = true;
            let sid = "";
            while (checked) {
                sid = genSid(createCampaignSubmitInput.itemIdx)
                const checkSid = await this.submitModelService.checkSid(sid)
                if (checkSid === 0) {
                    checked = false;
                }
            }

            // 1개의 아이디로 동일한 캠페인 승인 or 거절 확정 전까지는 1번만 신청 가능 and 1개의 아이디로 동일한 캠페인 승인 or 거절 확정이 3번 초과일때는 신청 불가
            // const checkMonthDuplicateSubmit = await this.submitModelService.checkMonthDuplicateSubmit(authUser.idx, createCampaignSubmitInput.campaignIdx);
            // 같은 캠페인 토탈 3번 거절
            // const checkMonthDuplicateReject = await this.submitModelService.checkMonthDuplicateReject(authUser.idx, createCampaignSubmitInput.campaignIdx);
            // const campaign = await this.campaignsService.getCampaign(createCampaignSubmitInput.campaignIdx);
            // const campaignItem = await this.campaignsService.getCampaignItemByIdx(createCampaignSubmitInput.itemIdx);

            //일자별
            campaignItem.channelNames = _getChannelName(campaignItem.channels);

            const startDate = getUnixTimeStampByDate9Sub(createCampaignSubmitInput.startDate);
            const endDate = getUnixTimeStampByDate9Sub(createCampaignSubmitInput.endDate);
            // const pay = campaignItem.priceOrig * (campaignItem.dc11/100) * createCampaignSubmitInput.nop;
            let pay = campaignItem.priceOrig * (campaignItem.dc11 / 100);

            //createCampaignSubmitInput.endDate - createCampaignSubmitInput.startDate
            const nights = (endDate - startDate) / 86400;

            if(campaignItem.minDays > 1){
                let minDays = campaignItem.minDays - 1;
                //nights 를 minDays 로 나눠 개수
                let count = Math.floor(nights / minDays);
                pay = pay * count;
            }

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
                regdate: getUnixTimeStamp(),
                autoCancelDate: getUnixTimeStampAfter3Days(), // 3일 후 자동 취소
                campaignName: campaign.name,
                itemName: campaignItem.name,
                payItem: pay,
                payTotal: pay,
                agreeContent: createCampaignSubmitInput.agreeContent,
            }

            console.log('==========> 🤩 : ' + inputData);

            let data = await this.submitModelService.createCampaignSubmit(inputData);

            if (data) {
                //캠페인 신청 알림
                let campaign = await this.campaignsService.getCampaign(createCampaignSubmitInput.campaignIdx);
                let campaignItem = await this.campaignsService.getCampaignItemByIdx(createCampaignSubmitInput.itemIdx);
                let partner = await this.membersService.getPartner(campaign.partnerIdx);
                let submitChannel = await this.membersService.getMemberSubmitChannel(createCampaignSubmitInput.submitChannel,authUser.idx);
                // let submitChannel = await this.membersService.getMemberSubmitChannel(createCampaignSubmitInput.submitChannel,15634);
                if(!submitChannel){
                    return {
                        code: 400,
                        message: '채널 정보가 존재하지 않습니다.',
                        data: null
                    }
                }
                console.log(submitChannel)
                let param = {
                    // name: authUser.username,
                    // partnerName: partner.corpName,
                    // campaignName: campaign.name,
                    // dayOfUse: `${createCampaignSubmitInput.startDate} ~ ${createCampaignSubmitInput.endDate}`,
                    // nop: createCampaignSubmitInput.nop,
                    // channelUrl: submitChannel.link,
                    // approvalLink: `https://wairi.co.kr/extranet/campaign/submit#/${data.raw.insertId}`,
                    // deadline: getAfter3Days(),
                    "이름": authUser.username,
                    "업체이름": partner.corpName,
                    "캠페인이름": campaign.name,
                    // "이용일자": `${createCampaignSubmitInput.startDate} ~ ${createCampaignSubmitInput.endDate}`,
                    "이용일자": createCampaignSubmitInput.startDate + ' ~ ' + createCampaignSubmitInput.endDate,
                    "인원": createCampaignSubmitInput.nop,
                    "채널주소": submitChannel.link,
                    "자동신청마감시간": getAfter3Days(),
                    "캠페인페이지승인링크": `https://wairi.co.kr/extranet/campaign/submit#/${data.raw.insertId}`,
                }
                console.log("=>(submit_model.resolver.ts:200) createCampaignSubmitInput.startDate", createCampaignSubmitInput.startDate);
                console.log("=>(submit_model.resolver.ts:201) typeof(", typeof(createCampaignSubmitInput.startDate));
                // await this.madein20ModelService.sendUserAlimtalk(authUser.phone, param, 'ZBQ0QxY7WI99M8UrfAHq');
                // await this.madein20ModelService.sendPartnerAlimtalk(param, '2jSKar7G587ZpGo6ZsKa', campaign.idx);

                // @ts-ignore
                await this.apiPlexService.sendUserAlimtalk('ZBQ0QxY7WI99',authUser.phone, param);
                await this.apiPlexService.sendPartnerAlimtalk('2jSKar7G587Z', param, campaign.idx);

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
            throw new HttpException(error.message, error.status);
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getSubmitList(
        @Args('take') take: number,
        @Args('page') page: number,
        @AuthUser() authUser: Member,
    ) {
        try {
            console.log("=>(submit_model.resolver.ts:172) getSubmitList 반복호출 : ", '반복호출');
            let data = await this.submitModelService.getSubmitList(authUser.idx, take, page);
            return data;
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, error.status);
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getSubmitDetail(
        @Args('sid') sid: string,
        @Args('reason') reason: string,
        @AuthUser() authUser: Member,
    ) {
        try {
            let data = await this.submitModelService.getSubmitDetail(sid, authUser.idx);
            return data;
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, error.status);
        }
    }

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async cancellationRequest(
        @Args('sid') sid: string,
        @Args('reason') reason: string,
        @AuthUser() authUser: Member,
    ) {
        try {
            let data = await this.submitModelService.cancellationRequest(sid, authUser.idx, reason);
            if (data) {
                //캠페인 신청 취소 알림
                let submit = await this.submitModelService.getSubmitDetail(sid, authUser.idx);
                let campaign = await this.campaignsService.getCampaign(submit.campaignIdx);
                let campaignItem = await this.campaignsService.getCampaignItemByIdx(submit.itemIdx);
                let partner = await this.membersService.getPartner(campaign.partnerIdx);
                let submitChannel = await this.membersService.getMemberSubmitChannel(submit.submitChannel,authUser.idx);
                let data = {
                    name: authUser.username,
                    partnerName: partner.corpName,
                    campaignName: campaign.name,
                    dayOfUse: `${submit.startDate} ~ ${submit.endDate}`,
                    nop: submit.nop,
                    channelUrl: submitChannel.link,
                    reason: reason
                }
                await this.madein20ModelService.sendPartnerAlimtalk(data, '72o88NAj9Gla9C1gIMLJ', campaign.idx);

                let at_data = {
                    "이름": authUser.username,
                    "업체이름": partner.corpName,
                    "캠페인이름": campaign.name,
                    // "이용일자": `${submit.startDate} ~ ${submit.endDate}`,
                    "이용일자": FROM_UNIXTIME_JS_PLUS(submit.startDate) + ' ~ ' + FROM_UNIXTIME_JS_PLUS(submit.endDate),
                    "인원": submit.nop,
                    "채널주소": submitChannel.link,
                    "취소사유": reason
                }
                //Todo 취소 알림톡 72o88NAj9Gla
                await this.apiPlexService.sendPartnerAlimtalk('72o88NAj9Gla', at_data, campaign.idx);


                return {
                    code: 200,
                    message: 'success',
                    data: data
                }
            } else {
                return {
                    code: 400,
                    message: 'fail',
                    data: null
                }
            }
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, error.status);
        }
    }

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async draftRegistration(
        @Args('draftRegistrationInput') draftRegistrationInput: DraftRegistrationInput,
        @AuthUser() authUser: Member,
    ) {
        try {
            let data = await this.submitModelService.draftRegistration(
                draftRegistrationInput.sid, draftRegistrationInput.postRemarks, authUser.idx);
            console.log("=>(submit_model.resolver.ts:194) data", data);
            if (data.affected === 1) {
                return {
                    code: 200,
                    message: '초안 등록이 완료되었습니다.',
                }
            } else {
                return {
                    code: 400,
                    message: '초안 등록이 실패하였습니다.',
                }
            }
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, error.status);
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getDraftDetail(
        @Args('sid') sid: string,
        @AuthUser() authUser: Member,
    ) {
        try {
            let data = await this.submitModelService.getDraftDetail(sid, authUser.idx);
            console.log("=>(submit_model.resolver.ts:220) data", data);
            return data;
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, error.status);
        }
    }

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async updateDraftRegistration(
        @Args('draftRegistrationInput') draftRegistrationInput: DraftRegistrationInput,
        @AuthUser() authUser: Member,
    ) {
        try {
            let data = await this.submitModelService.updateDraftRegistration(
                draftRegistrationInput.sid, draftRegistrationInput.postRemarks, authUser.idx);
            console.log("=>(submit_model.resolver.ts:220) data", data);
            if (data.affected === 1) {
                return {
                    code: 200,
                    message: '초안 수정이 완료되었습니다.',
                }
            } else {
                return {
                    code: 400,
                    message: '초안 수정이 실패하였습니다.',
                }
            }
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, error.status);
        }
    }

    @Mutation()
    @UseGuards(GqlAuthGuard)
    async completeDraftRegistration(
        @Args('draftCompleteInput') draftCompleteInput: DraftCompleteInput,
        @AuthUser() authUser: Member,
    ) {
        try {
            let data = await this.submitModelService.completeDraftRegistration(
                draftCompleteInput.sid, draftCompleteInput.url, authUser.idx);
            if (data.affected === 1) {

                //Todo apiplex 알림톡
                let submit = await this.submitModelService.getSubmitDetail(draftCompleteInput.sid, authUser.idx);
                const campaign = await this.submitModelService.getCampaignByCampaignIdx(submit.campaignIdx);
                const partner = await this.submitModelService.getPartnerByPartnerIdx(campaign.partnerIdx);
                // @ts-ignore
                let param = {
                    "업체이름" : partner.corpName,
                    "이름" : authUser.username,
                    "캠페인이름" : campaign.name,
                    // "이용일자" : `${submit.startDate} ~ ${submit.endDate}`,
                    "이용일자" : FROM_UNIXTIME_JS_PLUS(submit.startDate) + ' ~ ' + FROM_UNIXTIME_JS_PLUS(submit.endDate),
                    "인원" : submit.nop,
                    "콘텐츠URL" : draftCompleteInput.url,
                }
                await this.apiPlexService.sendPartnerAlimtalk('cOS69z2IOW5l', param, submit.campaignIdx);
                return {
                    code: 200,
                    message: '초안 수정이 완료되었습니다.',
                }
            } else {
                return {
                    code: 400,
                    message: '초안 수정이 실패하였습니다.',
                }
            }
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, error.status);
        }
    }

}
