import { Module } from '@nestjs/common';
import { BootpayService } from './bootpay.service';
import { BootpayController } from './bootpay.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Payment} from "../../entity/entities/Payment";

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Payment
        ]),
  ],
  controllers: [BootpayController],
  providers: [BootpayService]
})
export class BootpayModule {}
