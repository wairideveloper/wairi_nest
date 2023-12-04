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
        let receivers = await this.campaignRepository.createQueryBuilder('campaign')
            .where('campaign.idx = :idx', {idx: campaignIdx})
            .select('noteReceivers')
            .getRawOne();
        receivers = bufferToString(receivers)
        //JSON 으로 변환
        if(!receivers.noteReceivers){
            throw new Error('Failed to send Alimtalk: ' + 'noteReceivers is null');
        }
        receivers = JSON.parse(receivers.noteReceivers)
        //수신동의 여부 확인

        let phoneList = [];
        receivers.forEach((item) => {
            if (item.receiveSms == 1 && item.phone) {
                phoneList.push(item.phone)
            }
        })
        return phoneList;
    }

    async sendManagerAlimtalk(data: any, templateCode: string, division: string) {
        let phoneList = await this.managerConfig();
        const response = await this.sendAlimtalk(phoneList, templateCode, data)
        console.log("=>(madein20_model.service.ts:sendManagerAlimtalk) response", response);
    }

    async sendPartnerAlimtalk(data: any, templateCode: string, division: string = '', campaignIdx: number) {
        let phoneList = await this.partnerConfig(campaignIdx);
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
        // if(response.code != 1){
        //
        // }
        console.log("=>(madein20_model.service.ts:sendPartnerAlimtalk) response", response);
    }
    async sendAlimtalk(phoneList: any[], templateCode: string, params = []) {
        phoneList.map( async (phone) => {
            console.log(phone)
            let setParams = this.setParams(params, templateCode, phone);
            console.log("=>(madein20_model.service.ts:77) setParams", setParams);
            let axioData = {
                channelId: this.madein20ClientId,
                // templateCode: 'CA3Yum81n7dReQ8c6knU',
                templateCode: templateCode,
                receivers: [setParams],
                // alt: false
            };
            try {
                let headers = this.headers;
                const response = await axios.post(this.url, axioData, {headers});
                console.log("-> response", response.data);
            } catch (error) {
                this.logger.error('Failed to send Alimtalk DATA: ' + JSON.stringify(params));
                this.logger.error('Failed to send Alimtalk ERROR MSG: ' + error.message);
                throw new Error('Failed to send Alimtalk: ' + error.message);
            }
        })
    }

    private setParams(data: any, templateCode: string, phone: string) {
        switch (templateCode) {
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
                        '이용일자': data.name? data.name : '',
                        '인원': data.name? data.name : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '캠페인페이지승인링크': data.channelUrl? data.channelUrl : '',
                        '2일 후 낮 12시': data.channelUrl? data.channelUrl : '',
                        '자동신청마감시간': data.channelUrl? data.channelUrl : '',
                        '입금가': data.channelUrl? data.channelUrl : '',
                    }
                }
            case 'ZBQ0QxY7WI99M8UrfAHq' : // 캠페인 신청 대기 알림 (회원)
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '업체이름': data.campaignName? data.campaignName : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.name? data.name : '',
                        '인원': data.name? data.name : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '자동신청마감시간': data.channelUrl? data.channelUrl : ''
                    }
                }
            case '72o88NAj9Gla9C1gIMLJ' : // 캠페인 신청 취소 알림 (파트너)
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '업체이름': data.campaignName? data.campaignName : '',
                        '캠페인이름': data.campaignName? data.campaignName : '',
                        '이용일자': data.name? data.name : '',
                        '인원': data.name? data.name : '',
                        '채널주소': data.channelUrl? data.channelUrl : '',
                        '취소사유': data.channelUrl? data.channelUrl : ''
                    }
                }
            case 'kjR290Pm0Xac0NzLZNU2' : // 인플루언서 회원정보 변경 신청 완료 알림 (인플루언서 발송)
                return {
                    phone: phone,
                    params: {
                        '이름': data.name? data.name : '',
                        '변경내용': data.campaignName? data.campaignName : '', //Todo 벼경내용 개행 문자로
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
}
