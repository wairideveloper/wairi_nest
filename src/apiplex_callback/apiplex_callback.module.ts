import { Module } from '@nestjs/common';
import { ApiplexCallbackService } from './apiplex_callback.service';
import { ApiplexCallbackController } from './apiplex_callback.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {NotificationTalk} from "../../entity/entities/NotificationTalk";
import {NotificationTalkCallBack} from "../../entity/entities/NotificationTalkCallBack";

@Module({
  imports: [TypeOrmModule.forFeature([
      NotificationTalk, NotificationTalkCallBack
  ])],
  controllers: [ApiplexCallbackController],
  providers: [ApiplexCallbackService]
})
export class ApiplexCallbackModule {}
