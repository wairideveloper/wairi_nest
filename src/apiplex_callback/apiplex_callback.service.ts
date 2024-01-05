import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiplexCallbackService {

  findAll() {
    return `This action returns all apiplexCallback`;
  }

  findOne(id: number) {
    return `This action returns a #${id} apiplexCallback`;
  }

  remove(id: number) {
    return `This action removes a #${id} apiplexCallback`;
  }

  alimtalk_callback(msg_key: string, code: any, done_date: string, echo_to_webhook: any)
  {
    console.log("=>(apiplex_callback.service.ts:51) msg_key", msg_key);
    console.log("=>(apiplex_callback.service.ts:51) code", code);
    console.log("=>(apiplex_callback.service.ts:51) done_date", done_date);
    console.log("=>(apiplex_callback.service.ts:51) echo_to_webhook", echo_to_webhook);
  }
}
