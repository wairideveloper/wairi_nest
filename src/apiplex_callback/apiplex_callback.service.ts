import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {NotificationTalk} from "../../entity/entities/NotificationTalk";
import {Repository} from "typeorm";

@Injectable()
export class ApiplexCallbackService {

  constructor(
      @InjectRepository(NotificationTalk)
      private readonly notificationTalkRepository: Repository<NotificationTalk>
  ) {
  }

  findAll() {
    return `This action returns all apiplexCallback`;
  }

  findOne(id: number) {
    return `This action returns a #${id} apiplexCallback`;
  }

  remove(id: number) {
    return `This action removes a #${id} apiplexCallback`;
  }

  async alimtalk_callback(msg_key: string, code: any, done_date: string, echo_to_webhook: any)
  {
    let result = await this.notificationTalkRepository.createQueryBuilder('notification_talk')
        .update()
        .set({ status: code , done_date: done_date})
        .where("template_code = :template_code", { template_code: msg_key })
        .andWhere("echo_to_webhook = :echo_to_webhook", { echo_to_webhook: echo_to_webhook })
        .execute();
    console.log("=>(apiplex_callback.service.ts:36) result", result);

    return result;
  }
}
