import {Args, Int, Query, Resolver} from '@nestjs/graphql';
import {MembersService} from "./member.service";

import {UseGuards, Req, HttpException} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {bufferToString} from "../../util/common";
import {FetchPaginationInput} from "../../members/dto/fetch-pagination.input";
import {validate} from "class-validator";
import {AuthUser} from "../../auth/auth-user.decorator";
import {Member} from "../../../entity/entities/Member";

@Resolver('Member')
export class MemberResolver {
    constructor(private readonly membersService: MembersService) {
        console.log('MemberResolver')
    }

    @Query()
    @UseGuards(GqlAuthGuard)
    async getAllMember(
        // @Args() args?: FetchPaginationInput
        @Args() {skip, take, title}: FetchPaginationInput
    ) {
        try {
            console.log(skip, take)

            let data = await this.membersService.findAll(skip, take);

            data.forEach((element, index) => {
                if (element.regdate) {
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

    @Query((returns) => Member)
    @UseGuards(GqlAuthGuard)
    async setMemberChannel(@AuthUser() authUser: Member,
                           @Args('memberIdx', {type: () => Int}) memberIdx: number,
                           @Args('type', {type: () => Int}) type: number,
                           @Args('link', {type: () => String}) link: string,
    ) {
        try {
            const data = {
                memberIdx: authUser.idx,
                type: type,
                link: link
            }

            const channel = await this.membersService.setMemberChannel(data);
            const channelIdx = channel.raw.insertId;
            return {
                code: 200,
                message: '채널 등록 성공',
                idx: channelIdx,
                type: type,
                link: link
            }
        } catch (error) {
            throw new HttpException(error.message, 500);
        }
    }

    @Query((returns) => Member)
    @UseGuards(GqlAuthGuard)
    async deleteMemberChannel(@AuthUser() authUser: Member,
                              @Args('channelIdx', {type: () => Int}) channelIdx: number,
    ) {
        try {
            const data = {
                memberIdx: authUser.idx,
                channelIdx: channelIdx
            }
            const channel = await this.membersService.deleteMemberChannel(data);
            console.log("-> channel", channel);
            if(channel.affected > 0){
                return {
                    code: 200,
                    message: '채널 삭제 성공',
                    idx: channelIdx
                }
            }else{
                return {
                    code: 500,
                    message: '채널 삭제 실패',
                    idx: channelIdx
                }
            }
        }catch (error) {
            throw new HttpException(error.message, 500);
        }
    }
}