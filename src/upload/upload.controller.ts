import {Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors} from '@nestjs/common';
import { UploadService } from './upload.service';
import {FileInterceptor, FilesInterceptor} from "@nestjs/platform-express";

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }

  @Post('/multiple')
  @UseInterceptors(FilesInterceptor('files')) // FilesInterceptor
// @UseInterceptors(FilesInterceptor('files', 2)) // 업로드 파일을 3개로 제한
// @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 1 }])) // name 값이 files에 대한 limit
// @UseInterceptors(AnyFilesInterceptor()) // 모든 파일 받기
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) { // UploadedFiles
    console.log(files);
  }
}
