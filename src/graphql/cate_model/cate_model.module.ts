import { Module } from '@nestjs/common';
import { CateModelService } from './cate_model.service';
import { CateModelResolver } from './cate_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Cate} from "../../../entity/entities/Cate";
import {CateArea} from "../../../entity/entities/CateArea";

@Module({
  imports: [
    TypeOrmModule.forFeature([Cate, CateArea
    ]),
  ],
  providers: [CateModelResolver, CateModelService]
})
export class CateModelModule {}
