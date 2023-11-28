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
        receivers = JSON.parse(receivers.noteReceivers)
        //수신동의 여부 확인

        let phoneList = [];
        receivers.forEach((item) => {
            if (item.receiveSms == 1 && item.phone) {
                phoneList.push(item.phone)
            }
        })
        console.log("=>(madein20_model.service.ts:61) phoneList", phoneList);
    }

    async sendManagerAlimtalk(data: any, division: string, templateCode: string) {
        let phoneList = await this.managerConfig();
        console.log("=>(madein20_model.service.ts:80) phoneList", phoneList);

        phoneList.map( async (phone) => {
            console.log(phone)
            let setParams = this.setParams(data, templateCode, phone);
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
                this.logger.error('Failed to send Alimtalk DATA: ' + JSON.stringify(data));
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
        }
    }


    async sendAlimtalk(receivers: ReceiverInput, templateCode: string, params = []) {
        console.log("=>(madein20_model.service.ts:34) receivers", receivers);
        const url = 'https://api.madein20.com/messages/alimtalk/v1/messages';
        const headers = {
            'X-CLIENT-ID': `${process.env.MADEIN20_CLIENT_ID}`,
            'Content-Type': 'application/json;charset=UTF-8',
        };

        return
        const receiver =
            {
                // phone: '010-8230-8203',
                phone: '01082308203',
                params: {
                    '이름': 'submit.memberName',
                    '연락처': 'convert_phone(submit.memberPhone)', // convert_phone 함수 정의 필요
                    '취소사유': 'data.cancelReason',
                    '객실 구매정보 링크': '',
                    '예약번호': 'submit.sid',
                    '업체이름': 'submit.corpName',
                    '객실 타입': 'submit.itemName',
                    '이용일자': '',
                    '인원': `명`,
                },
            }
        const data = {
            channelId: process.env.MADEIN20_CHANNEL_ID,
            // templateCode: 'CA3Yum81n7dReQ8c6knU',
            templateCode: templateCode,
            receivers: [receiver],
            // alt: false
        };
        console.log(data)
//     return
        try {
            const response = await axios.post(url, data, {headers});
            console.log("-> response", response.data);
            //json
            this.logger.log('Alimtalk sent successfully' + JSON.stringify(data));
            return response.data;

        } catch (error) {
            this.logger.error('Failed to send Alimtalk DATA: ' + JSON.stringify(data));
            this.logger.error('Failed to send Alimtalk ERROR MSG: ' + error.message);
            throw new Error('Failed to send Alimtalk: ' + error.message);
        }
    }
}
