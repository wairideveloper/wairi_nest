import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CateModelService } from './cate_model.service';
import { CreateCateModelInput } from './dto/create-cate_model.input';
import { UpdateCateModelInput } from './dto/update-cate_model.input';

@Resolver('CateModel')
export class CateModelResolver {
  constructor(private readonly cateModelService: CateModelService) {}

  @Query(() => String)
  async getCategories() {
    try{
      return await this.cateModelService.getCategories();
    }catch (error) {
      throw error;
    }
  }
}
