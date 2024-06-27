import {Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import {DeviceModelService} from './device_model.service';
import {CreateDeviceModelInput} from './dto/create-device_model.input';
import {UpdateDeviceModelInput} from './dto/update-device_model.input';
import {UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {AuthUser} from "../../auth/auth-user.decorator";
import {Member} from "../../../entity/entities/Member";

class UpdateAllowInput {
    memberIdx: number;
    allow: string;
}

class DeleteDeviceInput {
    device_id: string;
}

@Resolver('DeviceModel')
export class DeviceModelResolver {
    constructor(private readonly deviceModelService: DeviceModelService) {
    }

    @Query('getDevices')
    async getDevices() {
        console.log("=>(device_model.resolver.ts:13) 'ㅅㄷㄴㅅㄷㄴㅅ", 'ㅅㄷㄴㅅㄷㄴㅅ');
        const devices = await this.deviceModelService.getDevices();
        console.log("=>(device_model.resolver.ts:13) devices", devices);
        return devices; // getDevices가 항상 배열을 반환하도록 보장
    }

    @Mutation('createDeviceModel')
    @UseGuards(GqlAuthGuard)
    async create(
        @Args('createDeviceModelInput') createDeviceModelInput: CreateDeviceModelInput,
        @AuthUser() authUser: Member
    ) {
        console.log("=>(device_model.resolver.ts:20) createDeviceModelInput", createDeviceModelInput);
        return this.deviceModelService.create(createDeviceModelInput,authUser);
    }

    @Mutation('updateAllow')
    @UseGuards(GqlAuthGuard)
    async updateAllow(
        @Args('updateDeviceModelInput') updateDeviceModelInput: UpdateDeviceModelInput,
        @AuthUser() authUser: Member
    ) {
        console.log("=>(device_model.resolver.ts:32) updateAllowInput", updateDeviceModelInput);
        return this.deviceModelService.updateAllow(updateDeviceModelInput,authUser);
    }

    @Mutation('deleteDeviceModel')
    // @UseGuards(GqlAuthGuard)
    async deleteDeviceModel(
        @Args('deleteDeviceInput') deleteDeviceInput: DeleteDeviceInput,
        @AuthUser() authUser: Member
    ) {
        console.log("=>(device_model.resolver.ts:40) deviceToken", deleteDeviceInput);
        return this.deviceModelService.deleteDeviceModel(deleteDeviceInput);
    }
}
