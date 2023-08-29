import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../../entity/entities/Member';
import { JwtService } from '@nestjs/jwt';
import {Config} from "../../entity/entities/Config";

@Module({
  imports: [TypeOrmModule.forFeature([Member,Config])],
  controllers: [MembersController],
  providers: [MembersService, JwtService],
})
export class MembersModule {}
