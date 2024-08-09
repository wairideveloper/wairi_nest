import { HttpException, Injectable } from '@nestjs/common';
import { ShortLink } from '../../entity/entities/ShortLink';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getNowYmdHis } from '../util/common';
import {AuthUser} from "../auth/auth-user.decorator";
import { Member } from 'entity/entities/Member';

@Injectable()
export class ShortLinkService {
  constructor(
    @InjectRepository(ShortLink)
    private readonly shortLinkRepository: Repository<ShortLink>,
    // private readonly memberRepository: Repository<Member>
  ) {}

  async getTest() {
    try {
      const code = await this.createRandomString();
      const data = {
        memberIdx:1 ,
        code: code,
        returnUrl: 'https://www.naver.com',
        count : 0,
        created_at: getNowYmdHis(),
      }
      const shortLink = await this.shortLinkRepository.save(data);

      return data;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  async createShortLink(
    originalUrl: string,
    memberIdx: number,
  ): Promise<ShortLink>  {
    try{
      // shortLink 중복체크
      // const shortLink = await this.shortLinkRepository.findOne({ where: { code: data.code } });
      // if(shortLink){
      //   return shortLink;
      // }

       // shortLink 생성
      const shortUrl = await this.createRandomString();
     
      const newShortLink = this.shortLinkRepository.create({
        memberIdx,
        code: shortUrl ,
        returnUrl: originalUrl,
        count: 0, 
        created_at: getNowYmdHis(),
      });
  
      // 데이터베이스에 저장
      const savedShortLink = await this.shortLinkRepository.save(newShortLink);
  
      return savedShortLink;

    }catch (e){
      throw new HttpException(e.message, e.status);
    }
  }

  // 숏링크 입력시 원래 url리턴
  async findByCode(code: string): Promise<ShortLink | undefined> {
    return this.shortLinkRepository.findOne({ where: { code } });
  }

  //20자리 난수 생성
  async createRandomString() {
    const randomString = Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11);
    console.log("=>(short_link.service.ts:42) randomString", randomString);
    //shortLink 중복체크
    const shortLink = await this.shortLinkRepository.findOne({ where: { code: randomString } });
    if(shortLink){
      await this.createRandomString();
    }
    return randomString;
  }
}