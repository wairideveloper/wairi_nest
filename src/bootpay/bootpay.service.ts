import {HttpException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Payment} from "../../entity/entities/Payment";
import {Repository} from "typeorm";
import {getNowUnix, getUnixTimeStampByDate} from "../util/common";
import {Connection} from "typeorm";
import {CampaignSubmit} from "../../entity/entities/CampaignSubmit";
import {CampaignItem} from "../../entity/entities/CampaignItem";
import {CampaignItemSchedule} from "../../entity/entities/CampaignItemSchedule";
import {SubmitModelService} from "../graphql/submit_model/submit_model.service";
@Injectable()
export class BootpayService {

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(CampaignSubmit)
        private readonly campaignSubmitRepository: Repository<CampaignSubmit>,
        @InjectRepository(CampaignItemSchedule)
        private readonly campaignItemScheduleRepository: Repository<CampaignItemSchedule>,
        @InjectRepository(CampaignItem)
        private readonly campaignItemRepository: Repository<CampaignItem>,
        private connection: Connection,
        private readonly submitModelService: SubmitModelService

    ) {}
    async updateVbankPayment(body) {
        if(body.status != 1){
            throw new HttpException("status is not 1", 404);
        }
        if(body.method !== "vbank"){
            console.log("=>(bootpay.service.ts:30) updateVbankPayment(가상계좌 외) : ", body);
            throw new HttpException(`가상계좌 알림 아님 X : (${body.method})`, 404);
        }
        console.log("=>(bootpay.controller.ts:10) 가상계좌 결제 완료 알림: ", body);

        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try{
            const payment = await queryRunner.manager.findOne(Payment, {
                where: {
                    oid: body.order_id
                }
            })
            if(!payment) {
                throw new Error("결제 정보가 존재하지 않습니다.")
            }
            const submit = await queryRunner.manager.findOne(CampaignSubmit, {
                where: {
                    idx: payment.submitIdx
                }
            })
            if(!submit) {
                throw new Error("신청 정보가 존재하지 않습니다.")
            }

            const campaignItemSchdule = await this.submitModelService.getCampaignItemSchduleByItemIdxAndRangeDate(
                submit.itemIdx, submit.startDate, submit.endDate)

            let itemSchduleIdx = [];
            campaignItemSchdule.forEach((item) => {
                // stock 확인 nop > stock
                itemSchduleIdx.push(item.idx);
                if(submit.nop > item.stock){
                    throw new HttpException("재고가 부족합니다.", 404);
                }
            })

            // update submit.status = 300
            await queryRunner.manager.createQueryBuilder()
                .update(CampaignSubmit)
                .set({
                    status: 300,
                    paymentIdx: payment.idx,
                })
                .where("idx = :idx", { idx: submit.idx })
                .execute();

            await queryRunner.manager.createQueryBuilder()
                .update(Payment)
                .set({
                    status: 200,
                    paydate: getUnixTimeStampByDate(body.purchased_at),
                })
                .where("oid = :oid", { oid: body.order_id })
                .andWhere("status = :status", { status: 100 })
                .execute();
            await queryRunner.commitTransaction();
        }catch (e) {
            await queryRunner.rollbackTransaction();
            console.log(e)
        }finally {
            await queryRunner.release();
        }
    }

    async updatePayment(body:any) {
        if(body.status != 1){
            throw new HttpException("status is not 1", 404);
        }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try{
            const payment = await queryRunner.manager.findOne(Payment, {
                where: {
                    oid: body.order_id
                }
            })
            if(!payment) {
                throw new Error("결제 정보가 존재하지 않습니다.")
            }
            const submit = await queryRunner.manager.findOne(CampaignSubmit, {
                where: {
                    idx: payment.submitIdx
                }
            })
            if(!submit) {
                throw new Error("신청 정보가 존재하지 않습니다.")
            }

            const camppaignItem = await queryRunner.manager.findOne(CampaignItem, {
                where: {
                    idx: submit.itemIdx
                }
            })

            let count: any;
            if(camppaignItem.calcType1 == 1){
                count = submit.nights;
            }else{
                count = submit.nop;
            }

            const campaignItemSchdule = await this.submitModelService.getCampaignItemSchduleByItemIdxAndRangeDate(
                submit.itemIdx, submit.startDate, submit.endDate)

            let itemSchduleIdx = [];
            campaignItemSchdule.forEach((item) => {
                // stock 확인 nop > stock
                itemSchduleIdx.push(item.idx);
                if(count > item.stock){
                    throw new HttpException("재고가 부족합니다.", 404);
                }
            })

            // update submit.status = 300
            await queryRunner.manager.createQueryBuilder()
                .update(CampaignSubmit)
                .set({
                    status: 300,
                    paymentIdx: payment.idx,
                })
                .where("idx = :idx", { idx: submit.idx })
                .execute();

            await queryRunner.manager.createQueryBuilder()
                .update(Payment)
                .set({
                    status: 200,
                    paydate: getUnixTimeStampByDate(body.purchased_at),
                })
                .where("oid = :oid", { oid: body.order_id })
                .andWhere("status = :status", { status: 100 })
                .execute();
            await queryRunner.commitTransaction();

        }catch (e){
            await queryRunner.rollbackTransaction();
            console.log(e)
        }finally {
            await queryRunner.release();
        }
    }

    async updateWebPayment(body) {
        if(body.status != 1){
            throw new HttpException("status is not 1", 404);
        }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try{
            const payment = await queryRunner.manager.findOne(Payment, {
                where: {
                    oid: body.order_id
                }
            })
            if(!payment) {
                throw new Error("결제 정보가 존재하지 않습니다.")
            }
            const submit = await queryRunner.manager.findOne(CampaignSubmit, {
                where: {
                    idx: payment.submitIdx
                }
            })
            if(!submit) {
                throw new Error("신청 정보가 존재하지 않습니다.")
            }

            if(submit.status == 200 && submit.use_app == 'N'){
                //update status = 300
                await queryRunner.manager.createQueryBuilder()
                    .update(CampaignSubmit)
                    .set({
                        status: 300,
                        paymentIdx: payment.idx,
                    })
                    .where("idx = :idx", { idx: submit.idx })
                    .execute();
            }
            if(submit.use_app == 'N') {
                await queryRunner.manager.createQueryBuilder()
                    .update(Payment)
                    .set({
                        status: 200,
                        paydate: getUnixTimeStampByDate(body.purchased_at),
                        payAmount: body.price,
                        receiptId: body.receipt_id,
                        cardName: body.payment_data ? body.payment_data.card_name : '',
                        cardNum: body.payment_data ? body.payment_data.card_no : '',
                    })
                    .where("oid = :oid", {oid: body.order_id})
                    // .andWhere("status = :status", { status: 100 })
                    .execute();
            }
            await queryRunner.commitTransaction();
        }catch (e) {
            console.log("=>(bootpay.service.ts:updateKakaoPayment) e", e);
            await queryRunner.rollbackTransaction();
            throw new HttpException(e.message,e.status );
        }finally {
            await queryRunner.release();
        }
    }
}
