import {Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import {CommonModelService} from './common_model.service';
import * as GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import * as Upload from "graphql-upload/Upload.js";
import {log} from "winston";
import {MembersService} from "../member_model/member.service";
import {UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {AuthUser} from "../../auth/auth-user.decorator";
import {Member} from "../../../entity/entities/Member";

@Resolver('CommonModel')
export class CommonModelResolver {
    constructor(
        private readonly commonModelService: CommonModelService,
        private readonly memberService: MembersService
    ) {
    }

    @Mutation((returns) => Member)
    @UseGuards(GqlAuthGuard)
    async signupUploadFile(
        @AuthUser() authUser: Member,
        @Args({name: 'file', type: () => GraphQLUpload})
            images: [Upload],
        @Args('originalname') originalname: string,
        @Args('type') type: number,
        @Args('url') url: string,
        @Args('average_visitor') average_visitor: number,
        @Args('subscriber') subscriber: number,
        @Args('content_count') content_count: number,
        @Args('followers') followers: number,
        @Args('follow') follow: number,
    ) {

        try {
            const file = await images;
            console.log("=>(common_model.resolver.ts:37) file", file);
            return
            // let imgUrl = await this.commonModelService.uploadImage(file.file);
            // if (imgUrl) {
            //     let channelData = {
            //         type: type, // 1. 네이버 블로그 2. 유투브 3. 인스타그램 9. 기타
            //         url: url,
            //         average_visitor: average_visitor,
            //         subscriber: subscriber,
            //         content_count: content_count,
            //         followers: followers,
            //         follow: follow,
            //         memberIdx: authUser.idx,
            //     }
            //
            //     channelData['filename'] = imgUrl;
            //     channelData['origName'] = originalname;
            //     channelData['level'] = 0; // 0. 승인대기 1. 인플루언서 2. 성장 9. 재승인요청 -1. 승인거절
            //     channelData['regdate'] = Math.floor(new Date().getTime() / 1000);
            //     let channel = await this.memberService.createMemberChannel(channelData);
            //     return channel;
            // }
        } catch (e) {
            console.log("-> e", e);
        }
    }
}
