import { Module } from '@nestjs/common';
import { BoardModelService } from './board_model.service';
import { BoardModelResolver } from './board_model.resolver';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Board} from "../../../entity/entities/Board";
import {BoardArticles} from "../../../entity/entities/BoardArticles";

@Module({
  imports: [
      TypeOrmModule.forFeature([Board, BoardArticles]),
  ],
  providers: [BoardModelResolver, BoardModelService]
})
export class BoardModelModule {}
