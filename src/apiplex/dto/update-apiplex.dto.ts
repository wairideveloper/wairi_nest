import { PartialType } from '@nestjs/mapped-types';
import { CreateApiplexDto } from './create-apiplex.dto';

export class UpdateApiplexDto extends PartialType(CreateApiplexDto) {}
