import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException} from '@nestjs/common';
import {MembersService} from './members.service';
import {CreateMemberDto} from './dto/create-member.dto';
import {UpdateMemberDto} from './dto/update-member.dto';
import {AuthGuard} from '../auth/auth.guard';
import {request, Request} from 'express';
import {AuthUser} from './members.decorator';
import {RestClient} from "@bootpay/server-rest-client"

@Controller('members')
export class MembersController {
    constructor(private readonly membersService: MembersService) {
    }

    @Post()
    create(@Body() createMemberDto: CreateMemberDto) {
        return this.membersService.create(createMemberDto);
    }

    @UseGuards(AuthGuard)
    @Get()
    async findAll() {
        // const data = await this.membersService.findAll();
        //
        // data.forEach((element) => {
        //     element.passwd = 'undifiend';
        // });
        //
        // return data;
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: number, @AuthUser() user: any) {
        // console.log('findOne');
        const data = await this.membersService.findOne(id);
        // console.log(data);
        if (data) {
            data.passwd = 'undifiend';
            return data;
        } else if(data == undefined) {
            throw new HttpException('Not Found', 404);
        }

    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
        return this.membersService.update(+id, updateMemberDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.membersService.remove(+id);
    }

    @Get('/members/graphql')
    async getMembers(@Req() req: Request) {
        const {query} = req.body;
        // return await this.membersService.findAll();
    }

    @Post('identityVerification')
    async identityVerification(@Body() body: any) {
        console.log("-> body", body.receipt_id);
        RestClient.setConfig(
            '6143fb797b5ba4002152b6e1',
            'RQ/RYIauHAVJZ8jkKggH6o3EIKKNnviRcGXN4hPNjiM='
        );

        RestClient.getAccessToken().then(function (tokenData) {
            // Access Token을 정상적으로 가져온 경우
            if (tokenData.status === 200) {
                RestClient.certificate(body.receipt_id).then(function (data) {
                    if (data.status === 200) {
                        console.log(data.data);

                        // TODO: 본인인증 검증이 완료되었고 가지고 온 데이터로 로직을 수행
                    }else {
                        throw new HttpException(data.message, Number(data.status));
                    }
                });
            } else {
                // AccessToken을 가져오는데 실패하였으니 로그를 확인해보시면 됩니다.
                throw new HttpException('AccessToken을 가져오는데 실패하였습니다.', Number(tokenData.status));
            }
        });

        // return await this.membersService.identityVerification(body);
    }
}
