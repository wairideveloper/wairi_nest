import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import {PaymentModelService} from './payment_model.service';
import {SubmitModelService} from "../submit_model/submit_model.service";
import {getBootpayStatusText} from "../../util/common";
import {HttpException, UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {AuthUser} from "../../auth/auth-user.decorator";
import {Member} from "../../../entity/entities/Member";
import {auth} from "firebase-admin";


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
    @UseGuards(GqlAuthGuard) //로그인 체크
    async confirmStock(
        @Args('confirmPaymentInput') confirmPaymentInput: ConfirmPaymentInput,
        @AuthUser() authUser: Member
    ) {
        console.log("=>(payment_model.resolver.ts:34) confirmPaymentInput.sid", confirmPaymentInput.sid);
        try {
            const submitItem = await this.submitModelService.getSubmitBySid(confirmPaymentInput.sid) //sid로 신청 정보 가져오기

            if (!submitItem) { //신청 정보가 없을 경우
                throw new HttpException("신청 정보가 존재하지 않습니다.", 404);
            }

            const campaignItemSchdule = await this.submitModelService.getCampaignItemSchduleByItemIdxAndRangeDate(
                submitItem.itemIdx, submitItem.startDate, submitItem.endDate) // 신청 정보의 itemIdx와 startDate로 스케쥴 정보 가져오기
            console.log("=>(payment_model.resolver.ts:44) campaignItemSchdule", campaignItemSchdule);

            if(campaignItemSchdule.length == 0){
                throw new HttpException("신청 가능한 스케쥴이 없습니다.", 404);
            }
            let itemSchduleIdx = [];
            campaignItemSchdule.forEach((item) => {
                // stock 확인 nop > stock
                itemSchduleIdx.push(item.idx);
                console.log("=>(payment_model.resolver.ts:48) submitItem.nop", submitItem.nop);
                console.log("=>(payment_model.resolver.ts:49) item.stock", item.stock);

                if (item.stock == 0) {
                    throw new HttpException("재고가 부족합니다.", 404);
                }
            })
            //재고 체크후 결제 confirm
            // authUser.idx set
            console.log(authUser)
            let memberIdx = authUser ? authUser.idx : 0;
            if(memberIdx == 0){
                throw new HttpException("로그인이 필요합니다.", 404);
            }
            console.log("=>(payment_model.resolver.ts:59) memberIdx", memberIdx);

            const response = await this.paymentModelService.confirmPayment(confirmPaymentInput, memberIdx);
            // console.log("=>(payment_model.resolver.ts:53) confirmPayment response", response);

            //가상계좌
            if (response.method_symbol === 'vbank') {
                //payment insert transaction
                const vbankDataTransaction = await this.paymentModelService.vbankDataTransaction(response, submitItem, memberIdx);
                console.log("=>(payment_model.resolver.ts:68) vbankDataTransaction", vbankDataTransaction);

                if (vbankDataTransaction) {
                    return {
                        status: response.status,
                        code: 200,
                        message: "가상계좌 발급이 완료되었습니다.",
                        data: response
                    }
                }
            }

            console.log("=>(payment_model.resolver.ts:90) itemSchduleIdx", itemSchduleIdx);
            console.log("=>(payment_model.resolver.ts:86) response", response);
            console.log("=>(payment_model.resolver.ts:86) submitItem", submitItem);
            console.log("=>(payment_model.resolver.ts:87) response.price", response.price);

            if (response.status === 1) {

                if ((submitItem.payTotal) != response.price) {
                    //cancelPayment
                    await this.paymentModelService.cancelPayment(response.receipt_id);
                    throw new HttpException("결제 금액이 일치하지 않습니다.", 404);
                }

                //재고 차감
                if (itemSchduleIdx.length > 0) {
                    console.log("=>(payment_model.resolver.ts:101) updateCampaignItemSchduleStock", '카드사용 재고차감 시작');
                    const result = await this.submitModelService.updateCampaignItemSchduleStock(
                        itemSchduleIdx,
                        submitItem.nop,
                        confirmPaymentInput.sid,
                        response,
                        // 12328, // memberIdx0114
                        memberIdx, // memberIdx
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
