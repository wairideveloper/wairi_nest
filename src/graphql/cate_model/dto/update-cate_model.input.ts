import { CreateCateModelInput } from './create-cate_model.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCateModelInput extends PartialType(CreateCateModelInput) {
  id: number;
}
