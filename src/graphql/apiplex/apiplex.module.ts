import { Module } from '@nestjs/common';
import { ApiplexService } from './apiplex.service';
import { ApiplexResolver } from './apiplex.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {NotificationTalk} from "../../../entity/entities/NotificationTalk";

@Module({
  imports: [TypeOrmModule.forFeature([
      NotificationTalk
  ])],
  providers: [ApiplexResolver, ApiplexService]
})
export class ApiplexModule {}
