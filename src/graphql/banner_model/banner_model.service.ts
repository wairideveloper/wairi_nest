import { Injectable } from '@nestjs/common';
import { CreateBannerModelInput } from './dto/create-banner_model.input';
import { UpdateBannerModelInput } from './dto/update-banner_model.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../../../entity/entities/Banner';
@Injectable()
export class BannerModelService {
    constructor(
        @InjectRepository(Banner)
        private bannerRepository: Repository<Banner>,
    ) {

    }
    async getBanner() {
        try{
            const data = await this.bannerRepository.find()
            console.log("=>(banner_model.service.ts:18) data", data);
            return data;
        }catch (error) {
            throw error;
        }
    }
}
