import { Resolver } from '@nestjs/graphql';
import { SubmitModelService } from './submit_model.service';

@Resolver('SubmitModel')
export class SubmitModelResolver {
  constructor(private readonly submitModelService: SubmitModelService) {}
}
