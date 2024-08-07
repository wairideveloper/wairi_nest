import { Module } from '@nestjs/common';
import { ShortLinkService } from './short_link.service';
import { ShortLinkController } from './short_link.controller';
import {ShortLink}   from '../../entity/entities/ShortLink';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShortLink])
  ],
  controllers: [ShortLinkController],
  providers: [ShortLinkService,JwtService]
})
export class ShortLinkModule {}
