import { Resolver, Query } from '@nestjs/graphql';
import { ApiplexService } from './apiplex.service';
import {getAfter3Days} from "../../util/common";
@Resolver()
export class ApiplexResolver {
  constructor(private readonly apiplexService: ApiplexService) {}

  @Query()
  async testapiplex() {
    try {
      console.log("=>(apiplex.resolver.ts:11) testapiplex", 'testapiplex');
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
