import {
    Controller, Get,
    Post, UploadedFile,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import {FileInterceptor, FilesInterceptor} from '@nestjs/platform-express';
import {UploadService} from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {
    }

    @Get('test')
    async test() {
        console.log("=>(auth.controller.ts:24) dfsfd", 'sfsdf');
        return 'test';
    }

    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file) {
        console.log(file)
    }

    @Post()
    @UseInterceptors(FilesInterceptor('file')) // 10은 최대파일개수
    async uploadFiles(@UploadedFiles() files) {
        console.log("=>(upload.controller.ts:24) files", files);
        const imgurl: string[] = [];
        // return this.uploadService.uploadImage(files);
        return this.uploadService.uploadImageV2(files);
    }

    @Post('uploadFileV2')
    @UseInterceptors(FilesInterceptor('file')) // 10은 최대파일개수
    async uploadFileV2(@UploadedFiles() files) {
        const imgurl: string[] = [];
        // return this.uploadService.uploadImage(files);
        return this.uploadService.uploadImageV2(files);
    }
}
