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
}
