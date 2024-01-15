import { Resolver, Query } from '@nestjs/graphql';
import { ApiplexService } from './apiplex.service';
import {getAfter3Days, randomString} from "../../util/common";
@Resolver()
export class ApiplexResolver {
  constructor(private readonly apiplexService: ApiplexService) {}

  @Query()
  async testapiplex() {
    try {
        const result = await this.apiplexService.recommendCode();
        // const result = await this.apiplexService.dormancy();
      return


      console.log("=>(apiplex.resolver.ts:11) testapiplex", 'testapiplex');
      let phoneList = ['01082308203'];
      await this.apiplexService.test2(phoneList,'Q93pUipflpNd', []);
      return

      let at_data = {
        "이름": 'authUser.username',
        "업체이름": 'partner.corpName',
        "캠페인이름": 'campaign.name',
        "이용일자": '`${submit.startDate} ~ ${submit.endDate}`',
        "인원": 'submit.nop',
        "채널주소": 'submitChannel.link',
        "취소사유": 'reason'
      }
      //Todo 취소 알림톡 72o88NAj9Gla
      await this.apiplexService.sendPartnerAlimtalk('72o88NAj9Gla', at_data, 776);
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
}
