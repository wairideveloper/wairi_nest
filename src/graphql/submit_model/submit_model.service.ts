import {Injectable, NotFoundException} from '@nestjs/common';
import {CampaignSubmit} from "../../../entity/entities/CampaignSubmit";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Pagination} from "../../paginate";
import {getUnixTimeStamp, switchSubmitStatusText} from "../../util/common";

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

    async getSubmitList(memberIdx: number, take: number, page: number) {
        let data = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            // .leftJoin("campaignSubmit.campaign", "campaign")
            .leftJoin("campaignSubmit.campaignItem", "campaignItem")
            .select([
                "campaignSubmit.idx as idx",
                "campaignSubmit.sid as sid",
                "campaignSubmit.status as status",
                "campaignSubmit.memberType as memberType",
                "campaignSubmit.memberType2 as memberType2",
                "campaignSubmit.nights as nights",
                "campaignSubmit.campaignIdx as campaignIdx",
                "campaignSubmit.itemIdx as itemIdx",
                "campaignSubmit.nop as nop",
                "campaignSubmit.startDate as startDate",
                "campaignSubmit.endDate as endDate",
                "campaignSubmit.submitChannel as submitChannel",
                "campaignSubmit.subContent2 as subContent2",
                "campaignSubmit.memberIdx as memberIdx",
                "campaignSubmit.regdate as regdate",
                "campaignSubmit.autoCancelDate as autoCancelDate",
                "campaignSubmit.campaignName as campaignName",
                "campaignSubmit.itemName as itemName",
                "campaignSubmit.payItem as payItem",
                "campaignSubmit.payTotal as payTotal",
                "campaignSubmit.agreeContent as agreeContent",
                'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignItemImage where itemIdx = campaignSubmit.itemIdx order by ordering asc limit 1)) as image',
            ])
            .addSelect('CONCAT(DATE(FROM_UNIXTIME(campaignSubmit.startDate)), " ~ ", DATE(FROM_UNIXTIME(campaignSubmit.endDate))) AS application_period')
            .where("campaignSubmit.memberIdx = :memberIdx", {memberIdx: memberIdx})
            .orderBy("campaignSubmit.regdate", "DESC")
            .offset(take * (page - 1))
            .limit(take)
            .getRawMany();

        let total = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            .select('*')
            .where("campaignSubmit.memberIdx = :memberIdx", {memberIdx: memberIdx})
            .getCount();

        let totalPage = Math.ceil(total / take);
        if (page > totalPage) {
            throw new NotFoundException();
        }
        const currentPage = page;

        if(data.length > 0) {
            data.forEach((item) => {
                item.status = switchSubmitStatusText(item.status);
            })
        }

        return new Pagination({
            data,
            total,
            totalPage,
            currentPage
        });
    }

    async getSubmitDetail(sid: string, memberIdx: number) {
        let data = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            .leftJoin("campaignSubmit.campaignItem", "campaignItem")
            .select([
                "campaignSubmit.idx as idx",
                "campaignSubmit.sid as sid",
                "campaignSubmit.status as status",
                "campaignSubmit.memberType as memberType",
                "campaignSubmit.memberType2 as memberType2",
                "campaignSubmit.nights as nights",
                "campaignSubmit.campaignIdx as campaignIdx",
                "campaignSubmit.itemIdx as itemIdx",
                "campaignSubmit.nop as nop",
                "campaignSubmit.startDate as startDate",
                "campaignSubmit.endDate as endDate",
                "campaignSubmit.submitChannel as submitChannel",
                "campaignSubmit.subContent2 as subContent2",
                "campaignSubmit.memberIdx as memberIdx",
                "campaignSubmit.regdate as regdate",
                "campaignSubmit.autoCancelDate as autoCancelDate",
                "campaignSubmit.campaignName as campaignName",
                "campaignSubmit.itemName as itemName",
                "campaignSubmit.payItem as payItem",
                "campaignSubmit.payTotal as payTotal",
                "campaignSubmit.agreeContent as agreeContent",
                'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignItemImage where itemIdx = campaignSubmit.itemIdx order by ordering asc limit 1)) as image',
            ])
            .addSelect('CONCAT(DATE(FROM_UNIXTIME(campaignSubmit.startDate)), " ~ ", DATE(FROM_UNIXTIME(campaignSubmit.endDate))) AS application_period')
            .where("campaignSubmit.sid = :sid", {sid: sid})
            .andWhere("campaignSubmit.memberIdx = :memberIdx", {memberIdx: memberIdx})
            .getRawOne();

        if(data) {
            data.status = switchSubmitStatusText(data.status);
        }

        return data;
    }

    async cancellationRequest(sid: string, memberIdx: number, reason: string) {
        //if($submit['status']<100 || $submit['status']>200){
        // 				$this->print_json(-1,'신청을 취소할 수 없는 상태입니다.');
        // 				exit();
        // 			}

        let submit = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            .select('*')
            .where("campaignSubmit.sid = :sid", {sid: sid})
            .andWhere("campaignSubmit.memberIdx = :memberIdx", {memberIdx: memberIdx})
            .getRawOne();

        if(submit.status < 100 || submit.status > 200) {
            return {
                code: -1,
                message: '신청을 취소할 수 없는 상태입니다.',
                data: null
            }
        }

        let data = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            .update(CampaignSubmit)
            .set({
                status: 950,
                statusDate900: getUnixTimeStamp(),
                cancelReason: reason,
                cancelUser: 1
            })
            .where("campaignSubmit.sid = :sid", {sid: sid})
            .andWhere("campaignSubmit.memberIdx = :memberIdx", {memberIdx: memberIdx})
            .execute();


        return data;
    }
}
