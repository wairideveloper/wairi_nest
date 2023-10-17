import {Injectable} from '@nestjs/common';
import {CreateCateModelInput} from './dto/create-cate_model.input';
import {UpdateCateModelInput} from './dto/update-cate_model.input';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Cate} from "../../../entity/entities/Cate";
import {CateArea} from "../../../entity/entities/CateArea";

@Injectable()
export class CateModelService {
    constructor(
        @InjectRepository(Cate)
        private cateRepository: Repository<Cate>,
        @InjectRepository(CateArea)
        private cateAreaRepository: Repository<CateArea>,
    ) {
    }

    async getCategories() {
        try {
            const cate = await this.cateRepository
                .createQueryBuilder('cate')
                .select('*')
                .addSelect('(SELECT COUNT(0)FROM campaign join campaignItem on campaign.idx = campaignItem.campaignIdx WHERE campaign.cateIdx = cate.idx AND (campaign.regDate + 86400 * 7) >= UNIX_TIMESTAMP() AND campaign.status = 200 AND campaign.remove = 0) AS newItem ')
                .orderBy('cate.ordering', 'ASC')
                .getRawMany()
            const cateArea = await this.cateAreaRepository
                .createQueryBuilder('cateArea')
                .select('*')
                .orderBy('cateArea.ordering', 'ASC')
                .getRawMany()

            let result = [];
            cate.forEach((item, index) => {
                result.push({
                    ...item,
                    cateArea: cateArea.filter((cateAreaItem, cateAreaIndex) => {
                        return cateAreaItem.cateIdx == item.idx
                    })
                })
            })
            // console.log("-> result", result);
            return result;
        } catch (error) {
            throw error;
        }
    }
}
