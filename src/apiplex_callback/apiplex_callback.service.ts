import { Injectable } from '@nestjs/common';
import { CreateApiplexCallbackDto } from './dto/create-apiplex_callback.dto';
import { UpdateApiplexCallbackDto } from './dto/update-apiplex_callback.dto';

@Injectable()
export class ApiplexCallbackService {
  create(createApiplexCallbackDto: CreateApiplexCallbackDto) {
    return 'This action adds a new apiplexCallback';
  }

  findAll() {
    return `This action returns all apiplexCallback`;
  }

  findOne(id: number) {
    return `This action returns a #${id} apiplexCallback`;
  }

  update(id: number, updateApiplexCallbackDto: UpdateApiplexCallbackDto) {
    return `This action updates a #${id} apiplexCallback`;
  }

  remove(id: number) {
    return `This action removes a #${id} apiplexCallback`;
  }
}
