import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Madein20ModelService } from './madein20_model.service';
import {ReceiverInput} from "./dto/receiver.input";
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
            return await this.madein20ModelService.sendManagerAlimtalk(data, 'test','EHu0hjNSYvP3y0ZSxSd2');

            const response = await this.madein20ModelService.sendAlimtalk(receiverInput,templateCode);
            return response;
        }catch (error){
            console.log(error)
            throw error;
        }
  }
}
