import {Body, Controller, Get, Post} from '@nestjs/common';
import { BootpayService } from './bootpay.service';

@Controller('bootpay')
export class BootpayController {
  constructor(private readonly bootpayService: BootpayService) {}

  @Post('vBankPayment')
  vBankPayment(@Body() body) {
    console.log("=>(bootpay.controller.ts:10) body", body);
    //JSON Decode 체크
    // 웹훅 서버에서 응답한 내용에서 JSON 파싱이 실패하였습니다. unexpected token at 'This action adds a new bootpay'


    return {"success":true}
  }

  @Get('vBankPayment2')
  vBankPayment2(@Body() body) {
    console.log("-> vBankPayment222")
    return 'This action adds a new bootpay222'
  }
}
