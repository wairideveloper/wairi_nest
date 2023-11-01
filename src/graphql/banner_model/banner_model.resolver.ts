import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BannerModelService } from './banner_model.service';

@Resolver('BannerModel')
export class BannerModelResolver {
  constructor(private readonly bannerModelService: BannerModelService) {}

  @Query(() => String)
  async getBanner() {
    try{
      return await this.bannerModelService.getBanner();
    }catch (error) {
      throw error;
    }
  }

  @Query(() => String)
  async getPopup() {
    try{
      return await this.bannerModelService.getPopup();
    }catch (error) {
      throw error;
    }
  }
}
