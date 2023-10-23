import { Injectable } from '@nestjs/common';
import {CampaignSubmit} from "../../../entity/entities/CampaignSubmit";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class SubmitModelService {
    /*
        100 : 승인 대기
        200 : 결제 대기']
        300 : 이용 전 // 인플루언서
        310 : 승인 전 // 일반
        320 : 이용 전 // 일반
        400 : 이용 완료
        500 : 포스팅 검수
        700 : 포스팅 완료
        950 :취소 대기
        900 :신청 취소
        -1 : 승인 거절
     */
    constructor(
        @InjectRepository(CampaignSubmit)
        private campaignSubmitRepository: Repository<CampaignSubmit>,
    ) {
    }
    async createCampaignSubmit(inputData: any) {
        let data = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            .insert()
            .into(CampaignSubmit)
            .values(inputData)
            .execute();

        return data;
    }

    async checkSid(sid: string) {
        let data = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            .select('*')
            .where("campaignSubmit.sid = :sid", {sid: sid})
            .getCount();

        return data;
    }
}
