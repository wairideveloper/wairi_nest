import { Module } from '@nestjs/common';
import { SubmitModelService } from './submit_model.service';
import { SubmitModelResolver } from './submit_model.resolver';

@Module({
  providers: [SubmitModelResolver, SubmitModelService]
})
export class SubmitModelModule {}
