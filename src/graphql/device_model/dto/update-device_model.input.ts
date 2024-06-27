import {CreateDeviceModelInput} from './create-device_model.input';
import {PartialType} from '@nestjs/mapped-types';

export class UpdateDeviceModelInput extends PartialType(CreateDeviceModelInput) {
    idx : number;
    platform: string;
    device_token: string;
}
