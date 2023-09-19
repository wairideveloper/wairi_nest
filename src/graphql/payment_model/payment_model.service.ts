import { Injectable } from '@nestjs/common';
import {Bootpay} from "@bootpay/backend-js";
import * as process from 'process';
@Injectable()
export class PaymentModelService {
    constructor() {
        Bootpay.setConfiguration({
            application_id: process.env.BOOTPAY_APPLICATION_ID,
            private_key: process.env.BOOTPAY_PRIVATE_KEY,
        })
    }

    async confirmPayment(receipt_id) {
        try {
            await Bootpay.getAccessToken()
            const response = await Bootpay.confirmPayment(receipt_id)
            console.log("-> response", response);
            return response
        } catch (e) {
            // 발급 실패시 오류
            console.log(e)
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
}
