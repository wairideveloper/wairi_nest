import { CreateBannerModelInput } from './create-banner_model.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateBannerModelInput extends PartialType(CreateBannerModelInput) {
  id: number;
}
