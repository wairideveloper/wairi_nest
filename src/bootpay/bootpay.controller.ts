import {Body, Controller, Get, Post} from '@nestjs/common';
import { BootpayService } from './bootpay.service';

@Controller('bootpay')
export class BootpayController {
  constructor(private readonly bootpayService: BootpayService) {}

  @Post('vBankPayment')
  vBankPayment(@Body() body) {
    console.log("-> vBankPayment")
    return 'This action adds a new bootpay'
  }

  @Get('vBankPayment')
  vBankPayment2(@Body() body) {
    console.log("-> vBankPayment222")
    return 'This action adds a new bootpay222'
  }
}
