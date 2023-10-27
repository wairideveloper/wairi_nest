import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import {PaymentModelService} from './payment_model.service';
import {getBootpayStatusText} from "../../util/common";
import {HttpException} from "@nestjs/common";


class ConfirmPaymentInput {
    receipt_id: string;
    itemIdx: number;
    price: number;
    nop: number;

}

@Resolver('PaymentModel')
export class PaymentModelResolver {
    constructor(private readonly paymentModelService: PaymentModelService) {
    }

    // @Query()
    @Mutation()
    async confirmPayment(
        @Args('confirmPaymentInput') confirmPaymentInput: ConfirmPaymentInput,
        // @Args('receipt_id', {type: () => String}) receipt_id: String,
    ) {
        try {
            const response = await this.paymentModelService.confirmPayment(confirmPaymentInput);
            console.log(getBootpayStatusText(response.status))
            return response;
        } catch (error) {
            throw new HttpException(error.message, error.error_code);
        }
    }

    @Query()
    async cancelPayment(
        @Args('receipt_id', {type: () => String}) receipt_id: String,
    ) {
        try {
            const response = await this.paymentModelService.cancelPayment(receipt_id);
            console.log(getBootpayStatusText(response.status))
            return response;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
}
