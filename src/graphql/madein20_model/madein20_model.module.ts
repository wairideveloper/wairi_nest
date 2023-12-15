import { Module } from '@nestjs/common';
import { Madein20ModelService } from './madein20_model.service';
import { Madein20ModelResolver } from './madein20_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Admin} from "../../../entity/entities/Admin";
import {Partner} from "../../../entity/entities/Partner";
import {Campaign} from "../../../entity/entities/Campaign";
import {Member} from "../../../entity/entities/Member";

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Admin, Partner, Campaign, Member
      ]),
  ],
  providers: [Madein20ModelResolver, Madein20ModelService]
})
export class Madein20ModelModule {}
