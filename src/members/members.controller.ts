import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException} from '@nestjs/common';
import {MembersService} from './members.service';
import {CreateMemberDto} from './dto/create-member.dto';
import {UpdateMemberDto} from './dto/update-member.dto';
import {AuthGuard} from '../auth/auth.guard';
import {request, Request} from 'express';
import {AuthUser} from './members.decorator';

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
        console.log(data);
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
}
