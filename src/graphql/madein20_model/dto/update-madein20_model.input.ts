import { CreateMadein20ModelInput } from './create-madein20_model.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateMadein20ModelInput extends PartialType(CreateMadein20ModelInput) {
  id: number;
}
