import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    Request,
    Res,
    HttpException,
    HttpStatus, Catch, UseFilters, Ip
} from '@nestjs/common';
import {Response} from 'express';
import {CampaignService} from './campaign.service';
import {CreateCampaignDto} from './dto/create-campaign.dto';
import {UpdateCampaignDto} from './dto/update-campaign.dto';
import {verifyToken} from "../util/common";

@Catch()
@Controller('campaign')
export class CampaignController {
    constructor(private readonly campaignService: CampaignService) {
    }

    @Post()
    create(@Body() createCampaignDto: CreateCampaignDto) {
        return this.campaignService.create(createCampaignDto);
    }

    @Get('main')
    async mainList(
        @Request() req,
        @Res() res: Response,
        @Query('page') page: number,
        @Query('take') take: number,
    ) {
        try {
            const list = await this.campaignService.mainList({take, page});
            res.status(HttpStatus.OK).json(list);
        } catch (error) {
            throw new HttpException({
                status: error.status,
                message: error
            }, HttpStatus.FORBIDDEN, {
                cause: error
            });
        }
    }

    @Get(':id')
    async findOne(
        @Request() req,
        @Res() res: Response,
        @Param('id') id: string) {
        try {
            const userInfo: any = verifyToken(req);
            const campaign = await this.campaignService.findOne(+id);
            const recent = this.campaignService.setRecency(+id, userInfo.idx, req.ip);
            res.status(HttpStatus.OK).json(campaign);
        } catch (error) {
            throw new HttpException({
                status: error.status,
                message: error
            }, HttpStatus.FORBIDDEN, {
                cause: error
            });
        }
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
        return this.campaignService.update(+id, updateCampaignDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.campaignService.remove(+id);
    }
}
