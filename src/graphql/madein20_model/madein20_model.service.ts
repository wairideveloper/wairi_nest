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
            case '2jSKar7G587ZpGo6ZsKa' :
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
        }
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
}
