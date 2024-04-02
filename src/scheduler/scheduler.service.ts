import { Injectable } from '@nestjs/common';
import { Campaign} from "../../entity/entities/Campaign";
import { CampaignItem} from "../../entity/entities/CampaignItem";
import { CampaignSubmit} from "../../entity/entities/CampaignSubmit";
import { CampaignItemSchedule} from "../../entity/entities/CampaignItemSchedule";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository, SelectQueryBuilder} from "typeorm";
@Injectable()
export class SchedulerService {
    constructor(
        @InjectRepository(Campaign)
        private campaignRepository: Repository<Campaign>,
        @InjectRepository(CampaignItem)
        private campaignItemRepository: Repository<CampaignItem>,
        @InjectRepository(CampaignSubmit)
        private campaignSubmitRepository: Repository<CampaignSubmit>,
        @InjectRepository(CampaignItemSchedule)
        private campaignItemScheduleRepository: Repository<CampaignItemSchedule>,
    ) {}

    async getApprovalRate() {
        // let submitCount = await this.campaignSubmitRepository
        //     .createQueryBuilder()
        //     .subQuery()
        //     .select([
        //         'campaignSubmit.campaignIdx as campaignIdx',
        //         'COUNT(*) AS submitCount'
        //     ])
        //     .from(CampaignSubmit, 'campaignSubmit')
        //     .where('campaignSubmit.status >= -1 ')
        //     .andWhere('campaignSubmit.status <= 950')
        //     .andWhere('campaignSubmit.regdate > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MONTH))')
        //     .groupBy('campaignSubmit.campaignIdx')
        //     .getRawMany()

        let recentSubmitCount = await this.campaignSubmitRepository
            .createQueryBuilder()
            .subQuery()
            .select([
                'campaignSubmit.campaignIdx as campaignIdx',
                'COUNT(*) AS submitCount'
            ])
            .from(CampaignSubmit, 'campaignSubmit')
            // .where('campaignSubmit.status >= 400')
            .where('campaignSubmit.status BETWEEN 200 AND 700')
            .andWhere('(campaignSubmit.statusDate900 = 0 OR campaignSubmit.statusDate900 IS NULL)')
            .andWhere('campaignSubmit.regdate > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MONTH))')
            .groupBy('campaignSubmit.campaignIdx')
            .getRawMany();


        let recentSubmitCountTotal = await this.campaignSubmitRepository
            .createQueryBuilder()
            .subQuery()
            .select([
                'campaignSubmit.campaignIdx as campaignIdx',
                'COUNT(*) AS submitCount'
            ])
            .from(CampaignSubmit, 'campaignSubmit')
            .andWhere('campaignSubmit.regdate > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 3 MONTH))')
            .groupBy('campaignSubmit.campaignIdx')
            .getRawMany();

        // ROUND((recentSubmitCount.submitCount / recentSubmitCountTotal.submitCount) * 100) AS approvalRate
        let approvalRate = recentSubmitCount.map(async (item, index) => {
            let total = recentSubmitCountTotal.find((totalItem) => totalItem.campaignIdx === item.campaignIdx);
            const approvalRate = Math.round((item.submitCount / total.submitCount) * 100)
            console.log("=>(scheduler.service.ts:68) approvalRate", approvalRate);
            //campaign update set approvalRate = approvalRate where idx = item.campaignIdx
            const updateApprovalRate = await this.campaignRepository
                .createQueryBuilder()
                .update(Campaign)
                .set({approvalRate: approvalRate})
                .where('idx = :idx', {idx: item.campaignIdx})
                .execute();

            return {
                campaignIdx: item.campaignIdx,
                submitCount: item.submitCount,
                total: total.submitCount,
                approvalRate: Math.round((item.submitCount / total.submitCount) * 100)
            }
        })

    }
}
