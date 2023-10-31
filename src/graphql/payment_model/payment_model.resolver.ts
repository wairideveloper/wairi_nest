import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import {PaymentModelService} from './payment_model.service';
import {SubmitModelService} from "../submit_model/submit_model.service";
import {getBootpayStatusText} from "../../util/common";
import {HttpException, UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {AuthUser} from "../../auth/auth-user.decorator";
import {Member} from "../../../entity/entities/Member";


class ConfirmPaymentInput {
    sid: string;
    receipt_id: string;
    itemIdx: number;
    price: number;
    nop: number;

}

@Resolver('PaymentModel')
export class PaymentModelResolver {
    constructor(private readonly paymentModelService: PaymentModelService
        , private readonly submitModelService: SubmitModelService
    ) {
    }

    @Mutation()
    // @UseGuards(GqlAuthGuard)
    async confirmStock(
        @Args('confirmPaymentInput') confirmPaymentInput: ConfirmPaymentInput,
        @AuthUser() authUser: Member
    ) {
        try {
            const submitItem = await this.submitModelService.getSubmitBySid(confirmPaymentInput.sid) //sid로 신청 정보 가져오기
            if(!submitItem){ //신청 정보가 없을 경우
                throw new HttpException("신청 정보가 존재하지 않습니다.", 404);
            }

            const campaignItemSchdule = await this.submitModelService.getCampaignItemSchduleByItemIdxAndRangeDate(
                submitItem.itemIdx, submitItem.startDate, submitItem.endDate) // 신청 정보의 itemIdx와 startDate로 스케쥴 정보 가져오기

            let itemSchduleIdx = [];
            campaignItemSchdule.forEach((item) => {
                // stock 확인 nop > stock
                itemSchduleIdx.push(item.idx);
                 if(submitItem.nop > item.stock){
                        throw new HttpException("재고가 부족합니다.", 404);
                 }
            })

            //재고 체크후 결제 confirm
            const response = await this.paymentModelService.confirmPayment(confirmPaymentInput, 12328);

            //가상계좌
            if(response.method_symbol === 'vbank'){
                //payment insert
                const vbankData = await this.paymentModelService.insertVbankPayment(response, submitItem.idx, 12328);

                if(vbankData) {
                    return {
                        status: response.status,
                        code: 200,
                        message: "가상계좌 발급이 완료되었습니다.",
                        data: response
                    }
                }else{
                    throw new HttpException("가상계좌 발급이 실패하였습니다.", 404);
                }
            }

            if(response.status === 1){
                //submitItem.payTotal == response.data.price;
                if((submitItem.payTotal * submitItem.nop) != response.price){
                    //cancelPayment
                    await this.paymentModelService.cancelPayment(response.receipt_id);
                    // throw new HttpException("결제 금액이 일치하지 않습니다.", 404);
                }

                //재고 차감
                if(itemSchduleIdx.length > 0){
                   const result = await this.submitModelService.updateCampaignItemSchduleStock(
                        itemSchduleIdx,
                        submitItem.nop,
                        confirmPaymentInput.sid,
                        response,
                        12328, // memberIdx
                        submitItem.idx
                        )
                }
            }

            return {
                status: response.status,
                code: 200,
                message: getBootpayStatusText(response.status),
                data: response
            }
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
