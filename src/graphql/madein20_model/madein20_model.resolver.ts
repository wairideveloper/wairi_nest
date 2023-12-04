import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Madein20ModelService } from './madein20_model.service';
import {ReceiverInput} from "./dto/receiver.input";
import {HttpException} from "@nestjs/common";
@Resolver('Madein20Model')
export class Madein20ModelResolver {
  constructor(private readonly madein20ModelService: Madein20ModelService) {}


  @Mutation()
    async sendAlimtalk(
        @Args('receiverInput') receiverInput: ReceiverInput,
        @Args('templateCode') templateCode: string,
    ){
        try{
            //test code
            let data = {
                idx : 1234,
                name : '테스트 알림톡',
                channelUrl : 'test'

            }
            //test code

            // return await this.madein20ModelService.partnerConfig(575);
            return await this.madein20ModelService.sendPartnerAlimtalk(data, '2jSKar7G587ZpGo6ZsKa','test', 654);
            return await this.madein20ModelService.sendPartnerAlimtalk(data, 'EHu0hjNSYvP3y0ZSxSd2','test', 653);
            return await this.madein20ModelService.sendManagerAlimtalk(data, 'EHu0hjNSYvP3y0ZSxSd2','test');

        }catch (error){
            console.log(error)
            throw new HttpException(error.message, error.status);
        }
  }
}
