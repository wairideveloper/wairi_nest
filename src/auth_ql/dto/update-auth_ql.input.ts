import { CreateAuthQlInput } from './create-auth_ql.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAuthQlInput extends PartialType(CreateAuthQlInput) {
  id: number;
}
