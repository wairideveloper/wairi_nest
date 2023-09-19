import {Resolver, Query, Args} from '@nestjs/graphql';
import { BoardModelService } from './board_model.service';

@Resolver('BoardModel')
export class BoardModelResolver {
  constructor(private readonly boardModelService: BoardModelService) {}

  @Query(() => String)
  async getBoardList(
      @Args('take', {type: () => Number}) take: number,
      @Args('page', {type: () => Number}) page: number,
      @Args('type', {type: () => Number}) type: number,

  ){
    try{
      const list = await this.boardModelService.getBoardList(type, take, page);
      return list;
    }catch (error){
      console.log(error)
      throw error;
    }
  }

}
