import {Injectable, NotFoundException} from '@nestjs/common';
import {CampaignSubmit} from "../../../entity/entities/CampaignSubmit";
import {CampaignItemSchedule} from "../../../entity/entities/CampaignItemSchedule";
import {Payment} from "../../../entity/entities/Payment";
import {InjectRepository} from "@nestjs/typeorm";
import {Brackets, Repository} from "typeorm";
import {Pagination} from "../../paginate";
import {FROM_UNIXTIME, getUnixTimeStamp, switchSubmitStatusText} from "../../util/common";
import {Connection} from "typeorm";
import { ReceiptResponseParameters } from '@bootpay/backend-js/lib/response';

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
        @InjectRepository(CampaignItemSchedule)
        private campaignItemScheduleRepository: Repository<CampaignItemSchedule>,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        private connection: Connection
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
            .leftJoin('campaign', 'campaign', 'campaign.idx = campaignItem.campaignIdx')
            .select([
                "campaign.cateIdx as cateIdx",
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
                "campaignSubmit.denyReason as denyReason",
                "campaignSubmit.cancelReason as cancelReason",
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

        if (data.length > 0) {
            // data.forEach((item) => {
            //     item.status = switchSubmitStatusText(item.status);
            // })
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
                "campaignSubmit.payTotal as payTotal",
                "campaignSubmit.startDate as startDate",
                "campaignSubmit.endDate as endDate",
                "campaignSubmit.submitChannel as submitChannel",
                "campaignSubmit.subContent2 as subContent2",
                "campaignSubmit.memberIdx as memberIdx",
                "campaignSubmit.regdate as regdate",
                "campaignSubmit.campaignName as campaignName",
                "campaignSubmit.itemName as itemName",
                "campaignSubmit.payItem as payItem",
                "campaignSubmit.payTotal as payTotal",
                "campaignSubmit.agreeContent as agreeContent",
                'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignItemImage where itemIdx = campaignSubmit.itemIdx order by ordering asc limit 1)) as image',
            ])
            .addSelect(`(${FROM_UNIXTIME('campaignSubmit.autoCancelDate')})`, 'autoCancelDate')
            .addSelect('CONCAT(DATE(FROM_UNIXTIME(campaignSubmit.startDate)), " ~ ", DATE(FROM_UNIXTIME(campaignSubmit.endDate))) AS application_period')
            .where("campaignSubmit.sid = :sid", {sid: sid})
            .andWhere("campaignSubmit.memberIdx = :memberIdx", {memberIdx: memberIdx})
            .getRawOne();
        console.log("=>(submit_model.service.ts:153) data", data);

        if (data) {
            // data.status = switchSubmitStatusText(data.status);
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

        if (submit.status < 100 || submit.status > 200) {
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

    async getSubmitBySid(sid: string) {
        let data = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            .select('*')
            .where("campaignSubmit.sid = :sid", {sid: sid})
            .andWhere('campaignSubmit.status = 100')
            .getRawOne();

        return data;
    }

    async getCampaignItemSchduleByItemIdxAndRangeDate(itemIdx, startDate, endDate) {
        let data = await this.campaignItemScheduleRepository.createQueryBuilder("campaignItemSchedule")
            .select('*')
            .where("campaignItemSchedule.itemIdx = :itemIdx", {itemIdx: itemIdx})
            .andWhere(new Brackets(qb => {
                qb.where("campaignItemSchedule.date >= :startDate", {startDate: startDate})
                    .andWhere("campaignItemSchedule.date <= :endDate", {endDate: endDate});
            }))
            .getRawMany();

        return data;

    }

    async updateCampaignItemSchduleStock(itemSchduleIdx: any[], nop: string,
                                         sid: string, response: ReceiptResponseParameters,
                                         memberIdx: number, submitIdx: number
                                         ) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
console.log("=>(submit_model.service.ts:217) response", response);

        try {
            let paymentDataInsert = await queryRunner.manager.createQueryBuilder()
                .insert()
                .into(Payment)
                .values({
                    status: response.status == 1? 200 : 100,
                    oid: response.order_id,
                    memberIdx: memberIdx,
                    submitIdx: submitIdx,
                    payTotal: response.price,
                    receiptId: response.receipt_id,
                    payMethod: response.method_origin_symbol,
                    regdate: getUnixTimeStamp(),
                    paydate: getUnixTimeStamp(),
                    cardName: response.card_data? response.card_data.card_company : '',
                    cardNum: response.card_data? response.card_data.card_no : '',
                    vbankCode: response.vbank_data? response.vbank_data.bank_code : '',
                    vbankNum: response.vbank_data? response.vbank_data.bank_account : '',
                })
                .execute();
            console.log("=>(submit_model.service.ts:256) paymentDataInsert", paymentDataInsert);

            //재고 차감
            let campaignItemSchduleUpdate = await queryRunner.manager.createQueryBuilder()
                .update(CampaignItemSchedule)
                .set({
                    stock: () => "stock - " + nop
                })
                .where("idx IN (:...idx)", { idx: itemSchduleIdx })
                .execute();

            let submitDataUpdate = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
                .update(CampaignSubmit)
                .set({
                    status: 300,
                    paymentIdx: paymentDataInsert.raw.insertId,

                })
                .where("campaignSubmit.sid = :sid", {sid: sid})
                .execute();

            await queryRunner.commitTransaction();

            return true;
        }catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
    }

    async draftRegistration(sid: string, postRemarks: string, memberIdx: number) {
        let data = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            .update(CampaignSubmit)
            .set({
                status: 500,
                postRemarks: postRemarks,
                statusDate500: getUnixTimeStamp()
            })
            .where("campaignSubmit.sid = :sid", {sid: sid})
            .andWhere('campaignSubmit.status = 400')
            .andWhere("campaignSubmit.memberIdx = :memberIdx", {memberIdx: memberIdx})
            .execute();

        return data;
    }

    async getDraftDetail(sid: string, memberIdx: number) {
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
                "campaignSubmit.payTotal as payTotal",
                "campaignSubmit.postRemarks as postRemarks",
                "campaignSubmit.startDate as startDate",
                "campaignSubmit.endDate as endDate",
                "campaignSubmit.submitChannel as submitChannel",
                "campaignSubmit.subContent2 as subContent2",
                "campaignSubmit.memberIdx as memberIdx",
                "campaignSubmit.regdate as regdate",
                "campaignSubmit.campaignName as campaignName",
                "campaignSubmit.itemName as itemName",
                "campaignSubmit.payItem as payItem",
                "campaignSubmit.payTotal as payTotal",
                "campaignSubmit.agreeContent as agreeContent",
                "campaignSubmit.postRemarks as postRemarks",
                'CONCAT("https://wairi.co.kr/img/campaign/",(select file_name from campaignItemImage where itemIdx = campaignSubmit.itemIdx order by ordering asc limit 1)) as image',
            ])
            .addSelect(`(${FROM_UNIXTIME('campaignSubmit.autoCancelDate')})`, 'autoCancelDate')
            .addSelect('CONCAT(DATE(FROM_UNIXTIME(campaignSubmit.startDate)), " ~ ", DATE(FROM_UNIXTIME(campaignSubmit.endDate))) AS application_period')
            .where("campaignSubmit.sid = :sid", {sid: sid})
            .andWhere('campaignSubmit.status = 500')
            .andWhere("campaignSubmit.memberIdx = :memberIdx", {memberIdx: memberIdx})
            .getRawOne();

        return data;
    }

    async updateDraftRegistration(sid: string, postRemarks: string, memberIdx: number) {
        let data = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            .update(CampaignSubmit)
            .set({
                postRemarks: postRemarks,
            })
            .where("campaignSubmit.sid = :sid", {sid: sid})
            .andWhere('campaignSubmit.status = 500')
            .andWhere("campaignSubmit.memberIdx = :memberIdx", {memberIdx: memberIdx})
            .execute();

        return data;

    }

    async completeDraftRegistration(sid: string, url: string, memberIdx: number) {
        let data = await this.campaignSubmitRepository.createQueryBuilder("campaignSubmit")
            .update(CampaignSubmit)
            .set({
                postUrl: url,
                // statusDate700: getUnixTimeStamp()
            })
            .where("campaignSubmit.sid = :sid", {sid: sid})
            .andWhere('campaignSubmit.status = 700')
            .andWhere("campaignSubmit.memberIdx = :memberIdx", {memberIdx: memberIdx})
            .execute();

        return data;
    }
}