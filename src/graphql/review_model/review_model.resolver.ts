import {Resolver, Query, Args} from '@nestjs/graphql';
import { ReviewModelService } from './review_model.service';

@Resolver('ReviewModel')
export class ReviewModelResolver {
  constructor(private readonly reviewModelService: ReviewModelService) {}

  @Query( )
  async getReviews(
      @Args('idx') idx: number,
      @Args('take') take: number,
      @Args('page') page: number,
  ){
    try{
      let data = await this.reviewModelService.getReviews(idx, take, page);
      return data;
    }catch(error){
      console.log(error)
      throw error;
    }
  }

  @Query()
  async getReview(
      @Args('idx') idx: number,
  ){
    try{
      console.log("=>(review_model.resolver.ts:28) idx", idx);
      let data = await this.reviewModelService.getReview(idx);
      return data;
    }catch(error){
      console.log(error)
      throw error;
    }
  }
}
