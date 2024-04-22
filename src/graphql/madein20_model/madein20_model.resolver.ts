import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Madein20ModelService } from './madein20_model.service';
import {ReceiverInput} from "./dto/receiver.input";
import {HttpException} from "@nestjs/common";
@Resolver('Madein20Model')
export class Madein20ModelResolver {
  constructor(private readonly madein20ModelService: Madein20ModelService) {}

    @Query()
    async campaignInfoUpdate(
        @Args('campaignIdx') campaignIdx: number,
    ){
        try{
            // let whereInIdx = [];
            // let campaign= await this.madein20ModelService.campaignInfo(campaignIdx);
            // campaign.forEach((item)=>{
            //     whereInIdx.push(item.idx);
            // })
            let whereInIdx =[541, 548, 550, 555, 558, 559, 562, 564, 566, 567, 570, 572, 578, 579, 580, 582, 583, 584, 588, 589, 591,
                592, 650, 655, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667];

            //whereInIdx 배열 안에 있는 idx를 루프를 돌며 캠페인 아이템 정보를 가져와서 info 컬럼의 데이터를 모두 합쳐 하나의 문자열로 만들어서 업데이트 한다.
            for (let i = 0; i < whereInIdx.length; i++) {
                let campaignItem = await this.madein20ModelService.campaignItemInfo(whereInIdx[i]);
                let info = '';
                let infoGuide = '';
                let infoRefund = '';
                campaignItem.forEach((item)=>{
                    info += item.info + '\n';
                })
                campaignItem.forEach((item)=>{
                    //infoGuide 가 '' 아니면 infoGuide 추가하고 아니면 추가하지 않는다.
                    if(infoGuide == ''){
                        infoGuide += item.infoGuide + '\n';
                    }
                })
                campaignItem.forEach((item)=>{
                    //infoRefund 가 '' 아니면 infoRefund 추가하고 아니면 추가하지 않는다.
                    if(infoRefund == ''){
                        infoRefund += item.infoRefund1 + '\n';
                    }
                })
                if(whereInIdx[i] == 541) {
                    console.log("=>(madein20_model.resolver.ts:44) info", info);
                }
                await this.madein20ModelService.updateCampaignInfo(whereInIdx[i], info, infoGuide, infoRefund);
            }
            return {
                message : '성공',
                code : 200
            }
        }catch (error){
            throw new HttpException(error.message, error.status);
        }
    }

    // @Query()
    // async growthType(){
    //     try{
    //         let data = await this.madein20ModelService.growthType();
    //
    //         let phoneList = data.phone;
    //         console.log("=>(madein20_model.resolver.ts:63) phoneList", phoneList);
    //
    //
    //         await this.madein20ModelService.sendAlimtalk([phone], 'S6xbU9c065tUSq1VquOa');
    //
    //         //Todo : phoneList 를 루프를 돌며 알림톡 발송
    //
    //         let memberIdxList = data.idx;
    //         console.log("=>(madein20_model.resolver.ts:65) memberIdxList", memberIdxList);
    //         // await this.madein20ModelService.sendAlimtalk(phoneList, 'S6xbU9c065tUSq1VquOa');
    //
    //         //Todo : memberChannel level -1 로 변경
    //         // await this.madein20ModelService.updateMemberChannel(memberIdxList);
    //
    //
    //
    //         return {
    //             message : '성공',
    //             code : 200,
    //             data: data
    //         }
    //     }catch (error){
    //         throw new HttpException(error.message, error.status);
    //     }
    // }
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
            // return await this.madein20ModelService.sendPartnerAlimtalk(data, '2jSKar7G587ZpGo6ZsKa',654);
            // return await this.madein20ModelService.sendPartnerAlimtalk(data, 'EHu0hjNSYvP3y0ZSxSd2', 653);
            // return await this.madein20ModelService.sendManagerAlimtalk(data, 'EHu0hjNSYvP3y0ZSxSd2','test');

        }catch (error){
            console.log(error)
            throw new HttpException(error.message, error.status);
        }
  }
}
