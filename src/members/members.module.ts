import { Global, Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../../entity/entities/Member';
import { MemberChannel } from '../../entity/entities/MemberChannel';
import { JwtService } from '@nestjs/jwt';
import {Config} from "../../entity/entities/Config";


@Global()
@Module({
  imports: [TypeOrmModule.forFeature([
    Member,
    Config, 
    MemberChannel]
    )],
  controllers: [MembersController],
  providers: [MembersService, JwtService],
})
export class MembersModule {}
