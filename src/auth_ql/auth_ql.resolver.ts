import {Resolver, Query, Mutation, Args, Int} from '@nestjs/graphql';
import {AuthQlService} from './auth_ql.service';
import {CreateAuthQlInput} from './dto/create-auth_ql.input';
import {UpdateAuthQlInput} from './dto/update-auth_ql.input';
import {FetchPaginationInput} from "../members/dto/fetch-pagination.input";
import {LoginResponse} from "../graphql/auth_ql_model/dto/login-response";
import {CampaignService} from "../campaign/campaign.service";

@Resolver('AuthQl')
export class AuthQlResolver {
    constructor(private readonly authQlService: AuthQlService,
    private readonly campaignsService: CampaignService){
        console.log('AuthQlResolver')
    }

    // @Mutation(returns => LoginResponse)
    // async login( @Args('loginInput') loginInput: LoginInput){
    //     const loginResult = await this.authQlService.login(loginInput);
    //
    //     if (loginResult.success) {
    //         return {
    //             message: '로그인 성공',
    //             memberIdx: loginResult,
    //             access_token: 'jwt',
    //             refresh_token: 'sdfsdf',
    //         };
    //     } else {
    //         // 로그인이 실패한 경우 오류 메시지 반환
    //         throw new Error('로그인 실패');
    //     }
    // }

    @Mutation('createAuthQl')
    create(@Args('createAuthQlInput') createAuthQlInput: CreateAuthQlInput) {
        return this.authQlService.create(createAuthQlInput);
    }

    @Query()
    async findAll(@Args('id', {type: () => Int}) id: number) {
        try {
            console.log(id)
            let data = await this.campaignsService.findOne(id);
            //json 형식으로 변환

            console.log(data)
            // console.log(bufferToString(data))
            // data.forEach((element) => {
            //     bufferToString(element);
            // });
            return data
        } catch (error) {
            console.log(error)
            throw error;
        }
        // try {
        //     return {
        //         message: '로그인 성공',
        //         access_token: 'jwt',
        //         refresh_token: 'sdfsdf',
        //     };
        // } catch (error) {
        //     console.log(error)
        //     throw error;
        // }
        //
        // return this.authQlService.findAll();
    }

    @Query('authQl')
    findOne(@Args('id') id: number) {
        return this.authQlService.findOne(id);
    }

    @Mutation('updateAuthQl')
    update(@Args('updateAuthQlInput') updateAuthQlInput: UpdateAuthQlInput) {
        return this.authQlService.update(updateAuthQlInput.id, updateAuthQlInput);
    }

    @Mutation('removeAuthQl')
    remove(@Args('id') id: number) {
        return this.authQlService.remove(id);
    }
}
