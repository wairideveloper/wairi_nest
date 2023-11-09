import { Injectable } from '@nestjs/common';
import {Bootpay} from "@bootpay/backend-js";
import * as process from 'process';
import {ReceiptResponseParameters} from "@bootpay/backend-js/lib/response";
import {getUnixTimeStamp} from "../../util/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Payment} from "../../../entity/entities/Payment";
import {Repository} from "typeorm";
@Injectable()
export class PaymentModelService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
    ) {
        Bootpay.setConfiguration({
            application_id: process.env.BOOTPAY_APPLICATION_ID,
            private_key: process.env.BOOTPAY_PRIVATE_KEY,
        })
    }

    async confirmPayment(confirmPaymentInput, memberIdx) {
        try {
            const {sid, receipt_id, itemIdx, price, nop} = confirmPaymentInput

            await Bootpay.getAccessToken()
            const response = await Bootpay.confirmPayment(receipt_id)
            console.log("=>(payment_model.service.ts:19) response", response);
            if(response.status === 1){
                console.log("-> response", response.status);
            }
            return response
        } catch (e) {
            // 발급 실패시 오류
            throw e
        }
    }

    async cancelPayment(receipt_id) {
        try {
            await Bootpay.getAccessToken()
            const response = await Bootpay.cancelPayment(
                {
                    receipt_id: receipt_id,
                }
            )
            console.log("-> response", response);
            return response
        } catch (e) {
            // 발급 실패시 오류
            console.log(e)
        }
    }

    async insertVbankPayment(response: ReceiptResponseParameters, submitIdx:number, memberIdx: number) {
        try{
            // 2023-11-02T18:42:59+09:00  unixtime으로 변환
            const expireDate = new Date(response.vbank_data.expired_at)
            // +9시간
            expireDate.setHours(expireDate.getHours() + 9)
            //unixtime
            const expireUnix = Math.floor(expireDate.getTime() / 1000)

            const insertData = {
                status: response.status == 1? 200 : 100,
                oid: response.order_id,
                memberIdx: memberIdx,
                submitIdx: submitIdx,
                payTotal: response.price,
                receiptId: response.receipt_id,
                payMethod: response.method_origin_symbol,
                regdate: getUnixTimeStamp(),
                cardName: response.card_data? response.card_data.card_company : '',
                cardNum: response.card_data? response.card_data.card_no : '',
                vbankCode: response.vbank_data? response.vbank_data.bank_code : '',
                vbankNum: response.vbank_data? response.vbank_data.bank_account : '',
                vbankExpire: response.vbank_data? expireUnix : 0,
            }

            const payment = this.paymentRepository.createQueryBuilder()
                .insert()
                .into(Payment)
                .values(insertData)
                .execute();

            if (payment) {
                return payment;
            }

        }catch (e) {
            console.log(e)
        }

    }
}
