import {Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import {MainModelService} from './main_model.service';
import {CreateMainModelInput} from './dto/create-main_model.input';
import {UpdateMainModelInput} from './dto/update-main_model.input';

@Resolver('MainModel')
export class MainModelResolver {
    constructor(private readonly mainModelService: MainModelService) {
    }

    @Query(() => String)
    async getMainPage(
        @Args({name: 'sort', type: () => String}) sort: string,
    ) {
        try {
            if(!sort){
                sort = "regdate"
            }
            return await this.mainModelService.getMainPage(sort);
        } catch (error) {
            throw error;
        }
    }
}
