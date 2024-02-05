import {HttpException, Injectable} from '@nestjs/common';
import { CreateBannerModelInput } from './dto/create-banner_model.input';
import { UpdateBannerModelInput } from './dto/update-banner_model.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../../../entity/entities/Banner';
import { Popup } from '../../../entity/entities/Popup';
import {bufferToString} from "../../util/common";
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
            //pageCode 1  , order ordering desc
            let data = await this.bannerRepository.find({where: {pageCode: 1}, order: {ordering: "DESC"}})
            if(data){
                data = bufferToString(data)
            }
            return data;
        }catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async getPopup() {
        try{
            // idx 85번 팝업만 노출 베타기간
            let data = await this.popupRepository.find({where: {idx: 100}, order: {idx: "DESC"}})

            // let data = await this.popupRepository.find({where: {display: 1}, order: {idx: "DESC"}})
            if(data){
                data = bufferToString(data)
            }
            return data;
        }catch (error) {
            console.log("=>(banner_model.service.ts:39) error", error);
            throw new HttpException(error.message, error.status);
        }
    }
}
