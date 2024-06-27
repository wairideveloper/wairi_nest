import { Module } from '@nestjs/common';
import { DeviceModelService } from './device_model.service';
import { DeviceModelResolver } from './device_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {MemberDevice} from "../../../entity/entities/MemberDevice";
import {Member} from "../../../entity/entities/Member";
import {JwtService} from "@nestjs/jwt";

@Module({
  imports: [TypeOrmModule.forFeature([MemberDevice,Member])],
  providers: [DeviceModelResolver, DeviceModelService, JwtService]
})
export class DeviceModelModule {}
