import { Module } from '@nestjs/common';
import { Madein20ModelService } from './madein20_model.service';
import { Madein20ModelResolver } from './madein20_model.resolver';

@Module({
  providers: [Madein20ModelResolver, Madein20ModelService]
})
export class Madein20ModelModule {}
