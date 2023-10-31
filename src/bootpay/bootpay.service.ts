import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Payment} from "../../entity/entities/Payment";
import {Repository} from "typeorm";
import {getNowUnix, getUnixTimeStampByDate} from "../util/common";

@Injectable()
export class BootpayService {

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
    ) {}
    async updateVbankPayment(body) {
        try{
            await this.paymentRepository.createQueryBuilder()
                .update(Payment)
                .set({
                    status: 200,
                    paydate: getUnixTimeStampByDate(body.purchased_at),
                })
                .where("oid = :oid", { oid: body.order_id })
                .andWhere("status = :status", { status: 100 })
                .execute();
        }catch (e) {
            console.log(e)
        }
    }
}
