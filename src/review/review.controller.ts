import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFiles,
    Res,
    HttpStatus
} from '@nestjs/common';
import {ReviewService} from './review.service';
import {CreateReviewDto} from './dto/create-review.dto';
import {UpdateReviewDto} from './dto/update-review.dto';
import {FilesInterceptor} from "@nestjs/platform-express";
import {multerDiskOptions} from "../util/multerOptions";
import {Response} from "express";

@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {
    }

    @Post()
    @UseInterceptors(FilesInterceptor('files', null, multerDiskOptions))
    async create(
        @Res() res: Response,
        @Body('content') content: string,
        @Body('memberIdx') memberIdx: string,
        @Body('campaignIdx') campaignIdx: string,
        @Body('itemIdx') itemIdx: string,
        @Body('submitIdx') submitIdx: string,
        @Body('rate') rate: string,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        //Todo 유저 검증 추가
        const result = await this.reviewService.create(
            content, files, memberIdx, campaignIdx, itemIdx, submitIdx, rate
        );
        res.status(HttpStatus.OK).json(result);
    }

    @Get('all/:id')
    findAll(@Param('id') id: string) {
        return this.reviewService.findAll(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reviewService.findOne(+id);
    }

    @Patch(':id')
    @UseInterceptors(FilesInterceptor('files', null, multerDiskOptions))
    async update(@Param('id') id: string,
                 @Res() res: Response,
                 @Body('content') content: string,
                 @Body('memberIdx') memberIdx: string,
                 @Body('campaignIdx') campaignIdx: string,
                 @Body('itemIdx') itemIdx: string,
                 @Body('submitIdx') submitIdx: string,
                 @Body('rate') rate: string,
                 @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        const result = await this.reviewService.update(+id, content, files, memberIdx, campaignIdx, itemIdx, submitIdx, rate);
        res.status(HttpStatus.OK).json(result);
    }

    @Delete(':id')
    async remove(@Param('id') id: string,
                 @Res() res: Response,
                 @Body('memberIdx') memberIdx: string,
    ) {
        const result = await this.reviewService.remove(+id, memberIdx);
        res.status(HttpStatus.OK).json(result);
    }
}
