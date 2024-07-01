import {HttpException, Injectable} from '@nestjs/common';
import {CreateDeviceModelInput} from './dto/create-device_model.input';
import {UpdateDeviceModelInput} from './dto/update-device_model.input';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {MemberDevice} from "../../../entity/entities/MemberDevice";
import {bufferToString, FROM_UNIXTIME_JS_PLUS, FROM_UNIXTIME_JS_STRING_PLUS9, getNowYmdHis} from "../../util/common";


@Injectable()
export class DeviceModelService {
    constructor(
        @InjectRepository(MemberDevice)
        private deviceModelRepository: Repository<MemberDevice>
    ) {
    }

    async create(createDeviceModelInput: CreateDeviceModelInput, authUser: any) {
        try {
            // 레코드가 이미 존재하는지 확인
            let existingDeviceModel = await this.deviceModelRepository.findOne({
                where: {
                    device_id: createDeviceModelInput.device_id,
                    memberIdx: authUser.idx,
                    // device_token: createDeviceModelInput.device_token
                }
            })

            if (existingDeviceModel) {
                // // 레코드가 존재하면 업데이트
                // existingDeviceModel.platform = createDeviceModelInput.platform;
                // existingDeviceModel.device_token = createDeviceModelInput.device_token;
                // existingDeviceModel.event = createDeviceModelInput.event;
                // existingDeviceModel.action = createDeviceModelInput.action;
                // existingDeviceModel.night = createDeviceModelInput.night;
                // existingDeviceModel.updated_at = getNowYmdHis();

                // await this.deviceModelRepository.save(existingDeviceModel);
                return bufferToString(existingDeviceModel); // 업데이트된 데이터 반환
            } else {
                // 레코드가 존재하지 않으면 인서트
                const data = {
                    device_id: createDeviceModelInput.device_id,
                    memberIdx: authUser.idx,
                    event: createDeviceModelInput.event,
                    action: createDeviceModelInput.action,
                    night: createDeviceModelInput.night,
                    platform: createDeviceModelInput.platform,
                    device_token: createDeviceModelInput.device_token,
                    created_at: getNowYmdHis(),
                };
                console.log("=>(device_model.service.ts:50) data", data);
                const result = await this.deviceModelRepository.save(data);
                return bufferToString(result); // 새로운 데이터 반환
            }
        } catch (e) {
            if (e.code == 'ER_DUP_ENTRY') {
                throw new HttpException('이미 등록된 토큰 정보가 존재합니다.', 400);
            }
            console.log("=>(device_model.service.ts:52) e", e);
            throw new HttpException(e.message, e.status);
        }
    }

    async update(updateDeviceModelInput: UpdateDeviceModelInput) {
        try {


        } catch (e) {
            console.log('=>(device_model.service.ts:31) e', e);
        }
    }

    remove(id: number) {
        return `This action removes a #${id} deviceModel`;
    }

    async getDevices() {
        try {
            const data = await this.deviceModelRepository.createQueryBuilder('memberDevice')
                .select('*')
                .orderBy('created_at', 'DESC')
                .getRawMany();
            bufferToString(data)
            console.log("=>(device_model.service.ts:83) data", data);
            data.map((item) => {
                item.created_at = FROM_UNIXTIME_JS_STRING_PLUS9(item.created_at);
                item.updated_at = FROM_UNIXTIME_JS_STRING_PLUS9(item.updated_at);
            });

            console.log('=>(device_model.service.ts:31) data', data);
            return data || [];
        } catch (e) {
            console.log("=>(device_model.service.ts:92) e", e);
            throw new HttpException(e.message, e.status);
        }
    }

    async updateAllow(updateDeviceModelInput: UpdateDeviceModelInput, authUser: any) {
        try {

            const existingDeviceModel = await this.deviceModelRepository.findOne({where: {memberIdx: authUser.idx}})

            if (existingDeviceModel) {
                existingDeviceModel.updated_at = getNowYmdHis();

                await this.deviceModelRepository.save(existingDeviceModel);
                return existingDeviceModel; // 업데이트된 데이터 반환
            } else {
                throw new HttpException('등록된 디바이스 정보가 존재하지 않습니다.', 400);
            }
        } catch (e) {
            throw new HttpException(e.message, e.status);
        }
    }

    async deleteDeviceModel(deleteDeviceInput: any) {
        console.log("=>(device_model.service.ts:111) deleteDeviceInput", deleteDeviceInput);
        try {
            const existingDeviceModel = await this.deviceModelRepository.createQueryBuilder('memberDevice')
                .select('*')
                .where('device_id = :device_id', {device_id: deleteDeviceInput.device_id})
                // .andWhere('memberIdx = :memberIdx', {memberIdx: authUser.idx})
                .getRawOne();
            console.log("=>(device_model.service.ts:118) existingDeviceModel", existingDeviceModel);

            if (existingDeviceModel) {
                await this.deviceModelRepository.delete(existingDeviceModel.idx);
                return {
                    code: 200,
                    message: '디바이스 정보가 삭제되었습니다.'
                };
            } else {
                throw new HttpException('등록된 디바이스 정보가 존재하지 않습니다.', 400);
            }

        } catch (e) {
            throw new HttpException(e.message, e.status);
        }
    }
}
