import {Controller, Get} from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('approval-rate')
    async getApprovalRate() {
        return await this.schedulerService.getApprovalRate();
    }
}
