import { Module } from '@nestjs/common';
import { ShortLinkService } from './short_link.service';
import { ShortLinkController } from './short_link.controller';
import {ShortLink}   from '../../entity/entities/ShortLink';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { MembersService } from '../members/members.service';
import { MembersModule } from '../members/members.module';
import { Member } from 'entity/entities/Member';
import { Repository } from 'typeorm';
import { MemberChannel } from 'entity/entities/MemberChannel';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShortLink,
      Member,
      MemberChannel]),
  ],
  controllers: [ShortLinkController],
  providers: [ShortLinkService,JwtService,MembersService]
})
export class ShortLinkModule {}
