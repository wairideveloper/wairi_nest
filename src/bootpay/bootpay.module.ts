import { Module } from '@nestjs/common';
import { BootpayService } from './bootpay.service';
import { BootpayController } from './bootpay.controller';

@Module({
  controllers: [BootpayController],
  providers: [BootpayService]
})
export class BootpayModule {}
