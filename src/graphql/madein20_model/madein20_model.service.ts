import {Injectable, Logger} from '@nestjs/common';
import {CreateMadein20ModelInput} from './dto/create-madein20_model.input';
import {UpdateMadein20ModelInput} from './dto/update-madein20_model.input';
import * as process from 'process';
//axios
import axios from 'axios';
import {ReceiverInput} from './dto/receiver.input';
import {prettyJSONStringify} from "@apollo/server/dist/cjs/runHttpQuery";
import {Admin} from "../../../entity/entities/Admin";
import {Partner} from "../../../entity/entities/Partner";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {AES_DECRYPT, bufferToString} from "../../util/common";
import {Campaign} from "../../../entity/entities/Campaign";
import {CampaignItem} from "../../../entity/entities/CampaignItem";
import {Member} from "../../../entity/entities/Member";
import {MemberChannel} from "../../../entity/entities/MemberChannel";

@Injectable()
export class Madein20ModelService {
    private readonly logger = new Logger(Madein20ModelService.name);
    private readonly madein20ClientId: string;
    private readonly url: string;
    private readonly headers: any;

    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        @InjectRepository(Partner)
        private partnerRepository: Repository<Partner>,
        @InjectRepository(Campaign)
        private campaignRepository: Repository<Campaign>,
        @InjectRepository(CampaignItem)
        private campaignItemRepository: Repository<CampaignItem>,
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        @InjectRepository(MemberChannel)
        private memberChannelRepository: Repository<MemberChannel>,
    ) {
        // client id
        this.madein20ClientId = "@wairi";

        this.url = 'https://api.madein20.com/messages/alimtalk/v1/messages';
        this.headers = {
            'X-CLIENT-ID': 'i598wjz8egN812iYLXBvSSwruE4qx0IQ',
            'Content-Type': 'application/json;charset=UTF-8',
        };
    }

    async managerConfig() {
        // 관리자 연락처 정보 가져오기
        let admins = await this.adminRepository.createQueryBuilder('admin')
            .where('receive_sms = :receive_sms', {receive_sms: 1})
            .select(`(${AES_DECRYPT('phone')})`, 'phone')
            .getRawMany();
        admins = bufferToString(admins)
        // 전화번호만 배열로 저장
        let phoneList = [];
        admins.forEach((item) => {
            phoneList.push(item.phone)
        })
        console.log("=>(madein20_model.service.ts:42) phoneList", phoneList);
        return phoneList;
    }

    async partnerConfig(campaignIdx: number) {
        // 파트너 연락처 정보 가져오기
        let partner = await this.partnerRepository.createQueryBuilder('partner')
            .leftJoin('campaign', 'campaign', 'campaign.partnerIdx = partner.idx')
            .where('campaign.idx = :idx', {idx: campaignIdx})
            .select(`(${AES_DECRYPT('contactPhone')})`, 'contactPhone')
            .getRawOne();
        partner = bufferToString(partner)

        let receivers = []
        let receiverData = await this.partnerRepository.createQueryBuilder('partner')
            .leftJoin('campaign', 'campaign', 'campaign.partnerIdx = partner.idx')
            .where('campaign.idx = :idx', {idx: campaignIdx})
            .select('partner.noteReceivers')
            .getRawOne();
        receiverData = bufferToString(receiverData)
        //JSON 으로 변환
        if(!receiverData.noteReceivers){
            console.log("=>(madein20_model.service.ts:74) receivers.noteReceivers: ", '추가연락처 없음');
        }else{
            receivers = JSON.parse(receiverData.noteReceivers)
        }

        //수신동의 여부 확인
        let contactPhone = partner.contactPhone? partner.contactPhone : false;
        if(contactPhone){
            receivers.push({phone: contactPhone, receiveSms: 1})
        }
        let phoneList = [];
        receivers.forEach((item) => {
            if (item.receiveSms == 1 && item.phone) {
                phoneList.push(item.phone)
            }
        })
        return phoneList;
    }

    async sendUserAlimtalk(phone: any ,data: any, templateCode: string, division: string = '') {

        try {
            const response = await this.sendAlimtalk([phone], templateCode, data)
            console.log("=>(madein20_model.service.ts:84) sendUserAlimtalk", response);
        } catch (error) {
            this.logger.error('Failed to send Alimtalk DATA: ' + JSON.stringify(data));
            this.logger.error('Failed to send Alimtalk ERROR MSG: ' + error.message);
            throw new Error('Failed to send Alimtalk: ' + error.message);
        }
    }
    async sendManagerAlimtalk(data: any, templateCode: string, division: string) {
        let phoneList = await this.managerConfig();
        const response = await this.sendAlimtalk(phoneList, templateCode, data)
        console.log("=>(madein20_model.service.ts:sendManagerAlimtalk) response", response);
    }

    async sendPartnerAlimtalk(data: any, templateCode: string, campaignIdx: number, division: string = '') {
        try {
            let phoneList = await this.partnerConfig(campaignIdx);
            console.log("=>(madein20_model.service.ts:111) phoneList : ", phoneList);

            let partner = await this.partnerRepository.createQueryBuilder('partner')
                .leftJoin('campaign', 'campaign', 'campaign.partnerIdx = partner.idx')
                .where('campaign.idx = :idx', {idx: campaignIdx})
                .select('partner.corpName', 'corpName')
                .addSelect('campaign.name', 'campaignName')
                .getRawOne();
            partner = bufferToString(partner)
            data.corpName = partner.corpName;
            data.campaignName = partner.campaignName;

            const response = await this.sendAlimtalk(phoneList, templateCode, data)
            console.log("=>(madein20_model.service.ts:123) sendPartnerAlimtalk response", response);
            // return await this.sendAlimtalk(['01082308203'], templateCode, data)
        }catch (e) {
            throw new Error('Failed to send sendPartnerAlimtalk: ' + e.message);
        }
    }
    async sendAlimtalk(phoneList: any[], templateCode: string, params = []) {
        phoneList.map( async (phone) => {
            console.log(phone)
            let setParams = this.setParams(params, templateCode, phone);
            console.log("=>(madein20_model.service.ts:77)  sendAlimtalk setParams", setParams);
            let axioData = {
                channelId: this.madein20ClientId,
                templateCode: templateCode,
                receivers: [setParams],
            };
            try {
                let headers = this.headers;
                const response = await axios.post(this.url, axioData, {headers});
                console.log("-> sendAlimtalk response", response.data);
                console.log("-> sendAlimtalk axioData", setParams);
            } catch (error) {
                this.logger.error('Failed to send Alimtalk DATA: ' + JSON.stringify(params));
                this.logger.error('Failed to send Alimtalk ERROR MSG: ' + error.message);
                throw new Error('Failed to send Alimtalk: ' + error.message);
            }
        })
    }

    private setParams(data: any, templateCode: string, phone: string) {
        switch (templateCode) {
            case 'S6xbU9c065tUSq1VquOa' :
                return {
                    phone: phone,
                }
            case 'EHu0hjNSYvP3y0ZSxSd2' :
                return {
                    phone: phone,
                    params: {
                        '이름': data.id? data.id+' 님' : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                    }
                }
            case '2jSKar7G587ZpGo6ZsKa' : // 캠페인 신청 알림 (파트너)
                return {
                    phone: phone,
                    name: data.corpName,
                    params: {
                        '업체이름' : data.corpName? data.corpName : '',
                        '이름': data.name? data.name : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.dayOfUse? data.dayOfUse : '',
                        '인원': data.nop? data.nop : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '캠페인페이지승인링크': data.approvalLink? data.approvalLink : '',
                        '2일 후 낮 12시': data.channelUrl? data.channelUrl : '',
                        '자동신청마감시간': data.deadline? data.deadline : '',
                        '입금가': data.channelUrl? data.channelUrl : '',
                    }
                }
            case 'ZBQ0QxY7WI99M8UrfAHq' : // 캠페인 신청 대기 알림 (회원)
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '업체이름': data.partnerName? data.partnerName : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.dayOfUse? data.dayOfUse : '',
                        '인원': data.nop? data.nop : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '자동신청마감시간': data.deadline? data.deadline : ''
                    }
                }
            case '72o88NAj9Gla9C1gIMLJ' : // 캠페인 신청 취소 알림 (파트너)
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '업체이름': data.partnerName? data.partnerName : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.dayOfUse? data.dayOfUse : '',
                        '인원': data.nop? data.nop : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '취소사유': data.reason? data.reason : ''
                    }
                }
            case 'kjR290Pm0Xac0NzLZNU2' : // 인플루언서 회원정보 변경 신청 완료 알림 (인플루언서 발송)
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        //내용을 개행 문자로 변경
                        '변경내용': data.changes? data.changes : '',
                    }
                }
            case 'kh0k73yd51k3jIk506VV' : // 캠페인 선정 알림 (승인) (인플루언서 발송)
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '업체이름': data.campaignName? data.campaignName : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.name? data.name : '',
                        '인원': data.name? data.name : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '신청내역링크': data.channelUrl? data.channelUrl : '',
                        '결제마감일': data.channelUrl? data.channelUrl : '',
                    }
                }
            case '148DrKHkbs2HhJSH1vfX' : // 이용 완료 알림 (인스타그래머)
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '업체이름': data.campaignName? data.campaignName : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.name? data.name : '',
                        '인원': data.name? data.name : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '업로드기간': data.channelUrl? data.channelUrl : '',
                        '업로드 링크': data.channelUrl? data.channelUrl : '',
                        '가이드라인 링크': data.channelUrl? data.channelUrl : '',
                        '게시링크': data.channelUrl? data.channelUrl : '',
                    }
                }
            case 'SuOwsMM3rmA5dlC3ao5M' : // 이용 완료 알림 (블로거)
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '업체이름': data.campaignName? data.campaignName : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.name? data.name : '',
                        '인원': data.name? data.name : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '업로드기간': data.channelUrl? data.channelUrl : '',
                        '업로드 링크': data.channelUrl? data.channelUrl : '',
                        '가이드라인 링크': data.channelUrl? data.channelUrl : '',
                        '게시링크': data.channelUrl? data.channelUrl : '',
                    }
                }
            case '591d648Ltv7Kow01x5YI' : // 이용 완료 알림 (유튜버)
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '업체이름': data.campaignName? data.campaignName : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.name? data.name : '',
                        '인원': data.name? data.name : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '업로드기간': data.channelUrl? data.channelUrl : '',
                        '업로드링크': data.channelUrl? data.channelUrl : '',
                        '가이드라인링크': data.channelUrl? data.channelUrl : ''
                    }
                }
            case '6z33tsC3tk0071tIjnHx' : // 캠페인 결제 리마인드 알림
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '업체이름': data.campaignName? data.campaignName : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.name? data.name : '',
                        '인원': data.name? data.name : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '결제마감일': data.channelUrl? data.channelUrl : '',
                        '신청내역페이지URL': data.channelUrl? data.channelUrl : ''
                    }
                }
            case 'cOS69z2IOW5l3BK7kl0K' : // 포스팅 완료 알림
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '업체이름': data.campaignName? data.campaignName : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.name? data.name : '',
                        '인원': data.name? data.name : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '콘텐츠URL': data.channelUrl? data.channelUrl : ''
                    }
                }
        }
    }

    async campaignInfo(campaignIdx: number) {
        let campaign = await this.campaignRepository.createQueryBuilder('campaign')
            .where('campaign.status = :status', {status: 200})
            .andWhere('campaign.remove = :remove', {remove: 0})
            .andWhere('campaign.info = :info', {info: ''})
            .select('campaign.idx', 'idx')
            .getRawMany();
        console.log("=>(madein20_model.service.ts:318) campaign", campaign);

        return campaign;
    }

    async campaignItemInfo(campaignIdx : number) {
        let campaignItem = await this.campaignItemRepository.createQueryBuilder('campaignItem')
            .where('campaignItem.campaignIdx = :campaignIdx', {campaignIdx: campaignIdx})
            .select('campaignItem.info', 'info')
            .addSelect('campaignItem.infoGuide', 'infoGuide')
            .addSelect('campaignItem.infoRefund1', 'infoRefund1')
            .getRawMany();

        return bufferToString(campaignItem);
    }

    async updateCampaignInfo(campaignIdx: number, info: string, infoGuide: string, infoRefund: string) {
        let campaign = await this.campaignRepository.createQueryBuilder('campaign')
            .update()
            .set({
                info: info,
                production_guide: infoGuide,
                caution: infoRefund
            })
            .where('campaign.idx = :idx', {idx: campaignIdx})
            .execute();
        console.log("=>(madein20_model.service.ts:342) campaign", campaign);
        return campaign;
    }

    /**
     * Retrieves the growth type of members based on specific conditions.
     * @returns {Promise<void>} - A promise that resolves with the growth type data.
     * @throws {Error} - If there is an error retrieving the growth type data.
     */
    async growthType() {
        try {
            let member = await this.memberRepository.createQueryBuilder('member')
                .leftJoin('member.memberChannel', 'memberChannel')
                //mc.level = 2 AND m.type = 1 AND  m.status in (1,9);
                .where('memberChannel.level = :level', {level: 2})
                .andWhere('member.type = :type', {type: 1})
                .andWhere('member.status in (:status)', {status: [1, 9]})
                .select([
                    `DISTINCT(CAST(AES_DECRYPT(UNHEX(member.phone),"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")as char)) as phone`,
                    'member.idx as idx',
                ])
                .getRawMany();
            member = bufferToString(member);
            const phone = member.map((item) => {
                return item.phone
            })
            const idx = member.map((item) => {
                return item.idx
            })
            return {
                phone: phone,
                idx: idx
            }
        }catch (e) {
            throw new Error('growthType: ' + e.message);
        }
    }

    async updateMemberChannel(memberIdxList: any[]) {
        try {
            let memberChannel = await this.memberChannelRepository.createQueryBuilder('memberChannel')
                .update()
                .set({
                    level: -1
                })
                .where('memberChannel.memberIdx in (:memberIdxList)', {memberIdxList: memberIdxList})
                .execute();
            console.log("=>(madein20_model.service.ts:342) memberChannel", memberChannel);
            return memberChannel;
        }catch (e) {
            throw new Error('updateMemberChannel: ' + e.message);
        }

    }
}
