import {Body, Controller, Get, Post, Res} from '@nestjs/common';
import { BootpayService } from './bootpay.service';

@Controller('bootpay')
export class BootpayController {
  constructor(private readonly bootpayService: BootpayService) {}

  @Post('vBankPayment')
  vBankPayment(@Body() body,@Res() res) {
    console.log("=>(bootpay.controller.ts:10) 가상계좌 결제 완료 알림: ", body);
    if(body.status == 1){
      this.bootpayService.updateVbankPayment(body)
    }

    //http status 200 으로 리턴 {"success":true}
    res.status(200).json({"success":true})
  }

  @Get('vBankPayment2')
  vBankPayment2(@Body() body,@Res() res) {
    console.log("-> vBankPayment222")
    return 'This action adds a new bootpay222'
  }
}
