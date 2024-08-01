import { Request } from 'express';
import {Controller, Get, Param, Req, Res} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  getHello(@Req() req: Request): string {
    console.log(req);
    return this.appService.getHello();
  }

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }


  //Static 이미지 접근경로
  @Get('/images/:path/:fileId')
  async getImage(@Param('path') path,
                 @Param('fileId') fileId,
                 @Res() res): Promise<any> {
    res.sendFile(fileId, { root: `uploads/${path}` });
  }
}
