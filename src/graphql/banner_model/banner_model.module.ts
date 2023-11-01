import { Module } from '@nestjs/common';
import { BannerModelService } from './banner_model.service';
import { BannerModelResolver } from './banner_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Banner} from "../../../entity/entities/Banner";
import {Popup} from "../../../entity/entities/Popup";

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner, Popup
    ]),
  ],
  providers: [BannerModelResolver, BannerModelService]
})
export class BannerModelModule {}
