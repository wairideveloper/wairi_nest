import {Body, Controller, Get, Post} from '@nestjs/common';
import { BootpayService } from './bootpay.service';

@Controller('bootpay')
export class BootpayController {
  constructor(private readonly bootpayService: BootpayService) {}

  @Get('vBankPayment')
  vBankPayment(@Body() body) {
    console.log("-> vBankPayment")
    return 'This action adds a new bootpay'
  }
}
