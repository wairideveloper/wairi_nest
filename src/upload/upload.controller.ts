import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('')
  @UseInterceptors(FilesInterceptor('file')) // 10은 최대파일개수
  async uploadFile(@UploadedFiles() files) {
    const imgurl: string[] = [];
    // return this.uploadService.uploadImage(files);
    return this.uploadService.uploadImageV2(files);
  }
}
