import {Args, Query, Resolver} from '@nestjs/graphql';
import { PaymentModelService } from './payment_model.service';
import {getBootpayStatusText} from "../../util/common";


@Resolver('PaymentModel')
export class PaymentModelResolver {
  constructor(private readonly paymentModelService: PaymentModelService) {}

  @Query()
  async confirmPayment(
      @Args('receipt_id', {type: () => String}) receipt_id: String,
  ){
    try{
      const response = await this.paymentModelService.confirmPayment(receipt_id);
      console.log(getBootpayStatusText(response.status))
      return response;
    }catch (error){
      console.log(error)
      throw error;
    }
  }

  @Query()
  async cancelPayment(
        @Args('receipt_id', {type: () => String}) receipt_id: String,
  ){
    try{
      const response = await this.paymentModelService.cancelPayment(receipt_id);
      console.log(getBootpayStatusText(response.status))
      return response;
    }catch (error){
      console.log(error)
      throw error;
    }
  }
}
