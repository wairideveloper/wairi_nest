import {Args, Int, Query, Resolver} from '@nestjs/graphql';
import {MembersService} from "../../members/members.service";
import {UseGuards, Req} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {bufferToString} from "../../util/common";
import {FetchPaginationInput} from "../../members/dto/fetch-pagination.input";
import {validate} from "class-validator";
@Resolver('Member')
export class MemberResolver {
    constructor(private readonly membersService: MembersService) {
        console.log('MemberResolver')
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getAllMember(
        // @Args() args?: FetchPaginationInput
        @Args() {skip,take,title}: FetchPaginationInput
    ) {
        try {
            console.log(skip,take)

            let data = await this.membersService.findAll(skip,take);

            data.forEach((element,index) => {
               if(element.regdate){
                   //time -> datetime 형식으로 변환
                     data[index].regdate = new Date(element.regdate * 1000).toISOString().slice(0, 19).replace('T', ' ');
                     data[index].lastUpdate = new Date(element.lastUpdate * 1000).toISOString().slice(0, 19).replace('T', ' ');
               }

               // bufferToString(element);
            });
            // console.log(data)
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getMember(@Args('id', {type: () => Int}) id: number) {
        try {
            let data = await this.membersService.findOne(id);

            if (data) {
                data = bufferToString(data);
            }

            if (data == undefined) {
                throw new Error('Not Found');
            }
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getMemberByEmail(@Args('email', {type: () => String}) email: string) {
        try {
            const data = await this.membersService.findByEmail(email);
            console.log(data.regdate);
            if (data == undefined) {
                throw new Error('Not Found');
            }
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
}