import { Injectable, Logger } from '@nestjs/common';
import { CreateMadein20ModelInput } from './dto/create-madein20_model.input';
import { UpdateMadein20ModelInput } from './dto/update-madein20_model.input';
import * as process from 'process';
//axios
import axios from 'axios';
import { ReceiverInput } from './dto/receiver.input';
import {prettyJSONStringify} from "@apollo/server/dist/cjs/runHttpQuery";

@Injectable()
export class Madein20ModelService {
  private readonly logger = new Logger(Madein20ModelService.name);
  create(createMadein20ModelInput: CreateMadein20ModelInput) {
    return 'This action adds a new madein20Model';
  }

  findAll() {
    return `This action returns all madein20Model`;
  }

  findOne(id: number) {
    return `This action returns a #${id} madein20Model`;
  }

  update(id: number, updateMadein20ModelInput: UpdateMadein20ModelInput) {
    return `This action updates a #${id} madein20Model`;
  }

  remove(id: number) {
    return `This action removes a #${id} madein20Model`;
  }

  async sendAlimtalk(receivers: ReceiverInput, templateCode: string, params = []) {
    const url = 'https://api.madein20.com/messages/alimtalk/v1/messages';
    const headers = {
      'X-CLIENT-ID': `${process.env.MADEIN20_CLIENT_ID}`,
      'Content-Type': 'application/json;charset=UTF-8',
    };

    const receiver =
      {
        // phone: '010-8230-8203',
        phone: '01082308203',
        params: {
          '이름': 'submit.memberName',
          '연락처': 'convert_phone(submit.memberPhone)', // convert_phone 함수 정의 필요
          '취소사유': 'data.cancelReason',
          '객실 구매정보 링크': '',
          '예약번호': 'submit.sid',
          '업체이름': 'submit.corpName',
          '객실 타입': 'submit.itemName',
          '이용일자': '',
          '인원': `명`,
        },
      }
    const data = {
      channelId: process.env.MADEIN20_CHANNEL_ID,
      // templateCode: 'CA3Yum81n7dReQ8c6knU',
      templateCode: templateCode,
      receivers: [receiver],
      // alt: false
    };
    console.log(data)
//     return
    try {
      const response = await axios.post(url, data, { headers });
      console.log("-> response", response.data);
      //json
      this.logger.log('Alimtalk sent successfully'+ JSON.stringify(data));
      return response.data;

    } catch (error) {
      this.logger.error('Failed to send Alimtalk DATA: '+ JSON.stringify(data));
      this.logger.error('Failed to send Alimtalk ERROR MSG: '+ error.message);
      throw new Error('Failed to send Alimtalk: ' + error.message);
    }
  }
}
