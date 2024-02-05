import { Resolver, Query } from '@nestjs/graphql';
import { ApiplexService } from './apiplex.service';
import {getAfter3Days, randomString} from "../../util/common";
import {HttpException} from "@nestjs/common";
import axios, { AxiosResponse, AxiosError } from 'axios';

@Resolver()
export class ApiplexResolver {
  constructor(private readonly apiplexService: ApiplexService) {}

  @Query()
  async testapiplex() {
    try {
        let at_data = {
            "이름": 'authUser.username',
            "업체이름": 'partner.corpName',
            "캠페인이름": 'campaign.name',
            "이용일자": '`${submit.startDate} ~ ${submit.endDate}`',
            "인원": 'submit.nop',
            "채널주소": 'submitChannel.link',
            "취소사유": 'reason'
        }
        await this.apiplexService.sendUserAlimtalk('Q93pUvpoPjLq', '01082308203', at_data);
        return

        const apiKey = 'AIzaSyAug04PXh8_zqzs3gTs8_5PTtQhjkFlCx4';
        const apiEndpoint = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apiKey}`;
        // const postData = {
        //     longDynamicLink: "https://wairiinc.page.link/?isi=6471933852&ibi=com.wairiCompany.wairi&efr=0&imv=0&link=https://wairiincpagelink.com/campaignView?sid%3D211110721209308&amv=0&apn=com.wairiInc.wairi"
        // };

        // 동적 링크 생성에 사용할 데이터
        const dynamicLinkData = {
            dynamicLinkInfo: {
                domainUriPrefix: 'https://wairiinc.page.link',
                link: 'https://wairiinc.page.link/campaignDetail?campaignIdx=771',
                androidInfo: {
                    androidPackageName: 'com.wairiInc.wairi',
                    androidMinPackageVersionCode: '0',
                    androidFallbackLink: 'https://play.google.com/store/apps/details?id=com.wairiInc.wairi',
                },
                iosInfo: {
                    iosBundleId: 'com.wairiCompany.wairi',
                    iosAppStoreId: '6471933852',
                },
            },
        };

        axios.post(apiEndpoint, dynamicLinkData, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response: AxiosResponse) => {
                // Handle the successful response
                console.log('Shortened URL:', response.data.shortLink);
            })
            .catch((error: AxiosError) => {
                // Handle errors
                console.error('Error:', error.response ? error.response.data : error.message);
            });

return


     // this.apiplexService.recommendCode();
     //  return
      //   const result = await this.apiplexService.recommendCode();
      //   // const result = await this.apiplexService.dormancy();
      // return
      //
      //
      // console.log("=>(apiplex.resolver.ts:11) testapiplex", 'testapiplex');
      // let phoneList = ['01082308203'];
      // await this.apiplexService.test2(phoneList,'Q93pUipflpNd', []);
      // return

      // let at_data = {
      //   "이름": 'authUser.username',
      //   "업체이름": 'partner.corpName',
      //   "캠페인이름": 'campaign.name',
      //   "이용일자": '`${submit.startDate} ~ ${submit.endDate}`',
      //   "인원": 'submit.nop',
      //   "채널주소": 'submitChannel.link',
      //   "취소사유": 'reason'
      // }

      await this.apiplexService.sendUserAlimtalk('Q93pUvpaEFkd', '01082308203', at_data);
      return

      //Todo 취소 알림톡 72o88NAj9Gla
      await this.apiplexService.sendPartnerAlimtalk('Q93pUvpaEFkd', at_data, 776);
      return
      // const result = await this.apiplexService.test();
      let param = {
        "이름": 'test',
        "업체이름": 'partner.corpName',
        "캠페인이름": 'campaign.name',
        "이용일자": '${createCampaignSubmitInput.startDate} ~ ${createCampaignSubmitInput.endDate}',
        "인원": 'createCampaignSubmitInput.nop',
        "채널주소": "https://pf.kakao.com/_xgxbxjK",
        "자동신청마감시간": getAfter3Days(),
        "캠페인페이지승인링크": 'https://wairi.co.kr/extranet/campaign/submit#/${data.raw.insertId}',
      }
      // await this.apiplexService.sendUserAlimtalk("EHu0hjNSYvP3", '01082308203', param);
      await this.apiplexService.sendPartnerAlimtalk("2jSKar7G587Z", param, 776);
      return {
        message: '성공',
        code: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  @Query()
  async growthType(){
    try{
      let data = await this.apiplexService.growthType();

      let phoneList = data.phone;
      let idxList = data.idx;
console.log("=>(apiplex.resolver.ts:64) phoneList", phoneList);
console.log("=>(apiplex.resolver.ts:65) idxList", idxList);
      let phone = '01082308203'
      // await this.apiplexService.sendAlimtalk([phone], 'Q93pUipflpNd');
      //Todo : phoneList 를 루프를 돌며 알림톡 발송

      // let memberIdxList = data.idx;
      // console.log("=>(madein20_model.resolver.ts:65) memberIdxList", memberIdxList);
      // await this.madein20ModelService.sendAlimtalk(phoneList, 'S6xbU9c065tUSq1VquOa');

      //Todo : memberChannel level -1 로 변경
      // await this.madein20ModelService.updateMemberChannel(memberIdxList);



      return {
        message : '성공',
        code : 200,
        // data: data
      }
    }catch (error){
      throw new HttpException(error.message, error.status);
    }
  }

}
