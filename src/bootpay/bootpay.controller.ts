import {Body, Controller, Get, Post, Res} from '@nestjs/common';
import { BootpayService } from './bootpay.service';

@Controller('bootpay')
export class BootpayController {
  constructor(private readonly bootpayService: BootpayService) {}

  @Post('vBankPayment')
  vBankPayment(@Body() body,@Res() res) {
    if(body.status == 1){
      if(body.method == "vbank") {
        this.bootpayService.updateVbankPayment(body)
        res.status(200).json({"success":true})
      }else if(body.method == "auth") {
        console.log("=>(bootpay.controller.ts:15) updateVbankPayment( auth ) : ", body);
        res.status(200).json({"success":true})
        res.status(200).json("OK")
      }else if (body.payment_data) {
        try {
          console.log("=>(bootpay.controller.ts:18) 웹 모든결제", body);
          this.bootpayService.updateWebPayment(body)
          res.status(200).json("OK")
        }catch(e){
          console.log("=>(bootpay.controller.ts:22) 웹 모든결제 에러", e);
          res.status(200).json("OK")
        }
      }else{
        console.log("=>(bootpay.controller.ts:23) 앱 결제", body);
        res.status(200).json({"success":true})
      }
      // }else if(body.method == "kakao") {
      //   this.bootpayService.updateKakaoPayment(body)
      //   res.status(200).json({"success":true})
      // }else{
      //   console.log("=>(bootpay.controller.ts:30) updateVbankPayment(가상계좌 외) : ", body);
      // }
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
