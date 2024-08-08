import { Controller, Get, Post, Body } from '@nestjs/common';
import { ShortLinkService } from './short_link.service';
import { AuthUser } from "../auth/auth-user.decorator";

@Controller('short-link')
export class ShortLinkController {
  constructor(private readonly shortLinkService: ShortLinkService) {}

  @Get()
  async getTest() {
    return await this.shortLinkService.getTest();
  }

  @Post()
  async createShortLink(
    @Body('url') url: string,
    @AuthUser() user: any, 
  ): Promise<any> {
    const memberIdx = user.id; // 사용자 ID 추출
    const allianceid = '3419652';
    const sid = '16519959';  

    if (!memberIdx) {
      throw new Error('User ID is not existed');
    }

    // originalUrl에 파라미터 추가
    const originalUrlWithParams = `${url}?allianceid=${allianceid}&sid=${sid}&memberid=${memberIdx}`;

    // 서비스 호출
    const shortLink = await this.shortLinkService.createShortLink(originalUrlWithParams, memberIdx);
    // return { shortUrl: shortLink.code }; // shortUrl 대신 code를 반환
    return {
      message: 'Short link created successfully',
      shortUrl: shortLink.code, // 생성된 숏링크 코드
      originalUrl: originalUrlWithParams, // 파라미터가 추가된 원본 URL
    };

  }

}

  // 트립 상품 링크 입력받아 ?allianceid=''sid=''&ouid={회원아이디} & 추가 파라미터 확인, 숏링크 생성  DB 저장 후 리턴

  // 숏링크 입력받아 원래 URL 리턴 (DB 조회) 테스트용 - 추후 삭제 (실 구현은 wairi.co.kr/shortLink/{숏링크} 도메인에서 처리)

  // wairi.co.kr/index/shortLink/난수
  // ouid(회원아이디) : jwt토큰 풀어서 해당 회원 idx찾아서 아이디를 찾아와서 붙이기
