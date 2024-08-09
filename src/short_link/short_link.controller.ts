import { Controller, Get, Post, Body, Param, Res, HttpException, HttpStatus, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { ShortLinkService } from './short_link.service';
import { AuthUser } from "../auth/auth-user.decorator";
import { Member } from '../../entity/entities/Member';
import { MembersService } from '../members/members.service';
import { GqlAuthGuard } from 'src/auth/GqlAuthGuard';

@Controller('short-link')
export class ShortLinkController {
  constructor(
    private readonly shortLinkService: ShortLinkService,
    private readonly membersService: MembersService,
  ) {}

  @Get()
  async getTest() {
    return await this.shortLinkService.getTest();
  }

  @Post()
  @UseGuards(GqlAuthGuard)
  async createShortLink(
    @Body('url') url: string,
    @AuthUser() user: Member,
  ): Promise<any> {
    
    const memberIdx = user.idx;
    // const memberIdx = 608;

    // MemberService를 사용하여 idx에 해당하는 Member 조회
    const memberid = await this.membersService.findIdByIdx(memberIdx);  
    const allianceid = '3419652';
    const sid = '16519959';    

    // originalUrl에 파라미터 추가
    const originalUrlWithParams = `${url}?allianceid=${allianceid}&sid=${sid}&memberid=${memberid}`;

    // 서비스 호출
    const shortLink = await this.shortLinkService.createShortLink(originalUrlWithParams, memberIdx);

    return {
      message: 'Short link created successfully',
      shortUrl: shortLink.code, // 생성된 숏링크 코드
      originalUrl: originalUrlWithParams, // 파라미터가 추가된 원본 URL
    };

  }

  @Get(':code')
  async redirectToOriginalUrl(
    @Param('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    const shortLink = await this.shortLinkService.findByCode(code);

    if (!shortLink) {
      res.status(404).send('Short link not found');
      console.log("shortLink 없음");
      return;
    }

    res.redirect(shortLink.returnUrl);
  }
}