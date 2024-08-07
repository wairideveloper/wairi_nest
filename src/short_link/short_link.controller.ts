import { Controller, Get } from '@nestjs/common';
import { ShortLinkService } from './short_link.service';

@Controller('short-link')
export class ShortLinkController {
  constructor(private readonly shortLinkService: ShortLinkService) {}

  @Get()
  async getTest() {
    return await this.shortLinkService.getTest();
  }

  // 트립 상품 링크 입력받아 ?allianceid=''sid=''&ouid={회원아이디} & 추가 파라미터 확인, 숏링크 생성  DB 저장 후 리턴

  // 숏링크 입력받아 원래 URL 리턴 (DB 조회) 테스트용 - 추후 삭제 (실 구현은 wairi.co.kr/shortLink/{숏링크} 도메인에서 처리)

}
