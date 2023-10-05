import { CreateCommonModelInput } from './create-common_model.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCommonModelInput extends PartialType(CreateCommonModelInput) {
  id: number;
}
