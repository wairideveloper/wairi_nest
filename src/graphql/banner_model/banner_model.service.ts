import {HttpException, Injectable} from '@nestjs/common';
import { CreateBannerModelInput } from './dto/create-banner_model.input';
import { UpdateBannerModelInput } from './dto/update-banner_model.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../../../entity/entities/Banner';
import { Popup } from '../../../entity/entities/Popup';
@Injectable()
export class BannerModelService {
    constructor(
        @InjectRepository(Banner)
        private bannerRepository: Repository<Banner>,
        @InjectRepository(Popup)
        private popupRepository: Repository<Popup>,
    ) {

    }
    async getBanner() {
        try{
            const data = await this.bannerRepository.find()
            console.log("=>(banner_model.service.ts:18) data", data);
            return data;
        }catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async getPopup() {
        try{
            const data = await this.popupRepository.find({where: {display: 1}, order: {idx: "DESC"}})
            console.log("=>(banner_model.service.ts:31) data", data);
            return data;
        }catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }
}
