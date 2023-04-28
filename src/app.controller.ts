import { Request } from 'express';
import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  getHello(@Req() req: Request): string {
    console.log(req);
    return this.appService.getHello();
  }
}
