import {Args, Int, Mutation, Query, Resolver} from '@nestjs/graphql';
import {MembersService} from "./member.service";

import {UseGuards, Req, HttpException} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {
    bufferToString, changeInterestsIndex,
    changeInterestsText,
    FROM_UNIXTIME,
    FROM_UNIXTIME_JS,
    getUnixTimeStamp
} from "../../util/common";
import {FetchPaginationInput} from "../../members/dto/fetch-pagination.input";
import {validate} from "class-validator";
import {AuthUser} from "../../auth/auth-user.decorator";
import {Member} from "../../../entity/entities/Member";
import {LoginInput} from "../auth_ql_model/dto/loginInput";
import {Madein20ModelService} from "../madein20_model/madein20_model.service";

class CeateMemberChannelInput {
    type: number;
    link: string;
    interests: string;
    channelName?: string;
}

class UpdateMemberChannelInput {
    idx: number;
    type: number;
    link: string;
    interests: number;
    channelName?: string;
}


@Resolver('Member')
export class MemberResolver {
    constructor(
        private readonly membersService: MembersService,
        private readonly madein20ModelService: Madein20ModelService
    ) {
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

    @Mutation((returns) => Member)
    @UseGuards(GqlAuthGuard)
    async createMemberChannel(@AuthUser() authUser: Member,
                           @Args('createMemberChannelInput',) createMemberChannelInput: CeateMemberChannelInput
    ) {
        try {
            let data = {
                memberIdx: authUser.idx,
                type: createMemberChannelInput.type,
                link: createMemberChannelInput.link,
                interests: changeInterestsIndex(createMemberChannelInput.interests),
                channelName: ""
            }
            if(createMemberChannelInput.type == 9){
                data['channelName'] = createMemberChannelInput.channelName;
            }

            const createChannel = await this.membersService.setMemberChannel(data);
            const channelIdx = createChannel.raw.insertId;
            if(channelIdx == undefined){
                return {
                    code: 500,
                    message: '채널 등록 실패',
                }
            }
            let getChannel = await this.membersService.getMemberChannel(channelIdx);
            if(getChannel){
                getChannel = bufferToString(getChannel);
            }
            return {
                code: 200,
                message: '채널 등록 성공',
                idx: channelIdx,
                type: getChannel.type,
                link: getChannel.link,
                interests: changeInterestsText(getChannel.interests),
                channelName: getChannel.typeText,
                regdate: FROM_UNIXTIME_JS(getChannel.regdate),
                level: getChannel.level,
            }
        } catch (error) {
            console.log("=>(member.resolver.ts:148) error", error);
            throw new HttpException(error.message, 500);
        }
    }

    @Mutation((returns) => Member)
    @UseGuards(GqlAuthGuard)
    async updateMemberChannel(@AuthUser() authUser: Member,
                                @Args('updateMemberChannelInput',) updateMemberChannelInput: UpdateMemberChannelInput
    ) {
        try {
            let data = {
                idx: updateMemberChannelInput.idx,
                memberIdx: authUser.idx,
                type: updateMemberChannelInput.type,
                link: updateMemberChannelInput.link,
                interests: updateMemberChannelInput.interests,
                channelName: ""
            }
            if(updateMemberChannelInput.type == 9){
                data['channelName'] = updateMemberChannelInput.channelName;
            }

            const channel = await this.membersService.updateMemberChannel(data);
            if(channel.affected > 0){
                let getChannel = await this.membersService.getMemberChannel(updateMemberChannelInput.idx);
                if(getChannel){
                    getChannel = bufferToString(getChannel);
                }

                //개행문자 \n 추가
                let html = "";
                updateMemberChannelInput.channelName ? html += `채널명 : ${updateMemberChannelInput.channelName} \n` : "";
                updateMemberChannelInput.link ? html += `   링크 : ${updateMemberChannelInput.link} \n` : "";
                updateMemberChannelInput.interests ? html += `   관심분야 : ${changeInterestsText(updateMemberChannelInput.interests)} \n` : "";


                let param = {
                    name: authUser.username,
                    changes: html
                }

                await this.madein20ModelService.sendUserAlimtalk(authUser.phone, param, 'kjR290Pm0Xac0NzLZNU2');

                return {
                    code: 200,
                    message: '채널 수정 성공',
                    idx: updateMemberChannelInput.idx,
                    type: getChannel.type,
                    link: getChannel.link,
                    interests: changeInterestsText(getChannel.interests),
                    channelName: getChannel.typeText,
                    regdate: FROM_UNIXTIME_JS(getChannel.regdate),
                    level: getChannel.level,
                }
            }else{
                return {
                    code: 500,
                    message: '채널 수정 실패',
                    idx: updateMemberChannelInput.idx
                }
            }
        } catch (error) {
            throw new HttpException(error.message, 500);
        }
    }

    @Mutation((returns) => Member)
    @UseGuards(GqlAuthGuard)
    async deleteMemberChannel(@AuthUser() authUser: Member,
                              @Args('channelIdx', {type: () => Int}) channelIdx: number,
    ) {
        try {
            console.log("=>(member.resolver.ts:140) channelIdx", channelIdx);
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

    @Query()
    @UseGuards(GqlAuthGuard)
    async getMemberChannel(@AuthUser() authUser: Member){
        try{
            let data = await this.membersService.getMemberChannelAll(authUser.idx);
            // let data = await this.membersService.getMemberChannelAll(15807);
            if(data.length > 0){
                data = bufferToString(data);
            }
            data.forEach((element, index) => {
                if (element.regdate) {
                    //time -> datetime 형식으로 변환
                    data[index].regdate = FROM_UNIXTIME_JS(element.regdate);
                }
                data[index].interests = changeInterestsText(element.interests);
                data[index].channelName = element.typeText;
            })
            return data;

        } catch (error) {
            console.log("=>(member.resolver.ts:246) error", error);
            throw new HttpException(error.message, 500);
        }
    }
}
