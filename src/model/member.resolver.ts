import {Args, Int, Query, Resolver} from '@nestjs/graphql';
import {MembersService} from "../members/members.service";
import {UseGuards, Req} from "@nestjs/common";
import {GqlAuthGuard} from "../auth/GqlAuthGuard";

@Resolver('Member')
export class MemberResolver {
    constructor(private readonly membersService: MembersService) {
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getAllMember() {
        try {
            const data = await this.membersService.findAll();
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
            const data = await this.membersService.findOne(id);
            if(data == undefined) {
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
            if(data == undefined) {
                throw new Error('Not Found');
            }
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
}