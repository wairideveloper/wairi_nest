import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiplexService } from './apiplex.service';
import { CreateApiplexDto } from './dto/create-apiplex.dto';
import { UpdateApiplexDto } from './dto/update-apiplex.dto';

@Controller('apiplex')
export class ApiplexController {
  constructor(private readonly apiplexService: ApiplexService) {}

  @Post()
  create(@Body() createApiplexDto: CreateApiplexDto) {
    return this.apiplexService.create(createApiplexDto);
  }

  @Get()
  findAll() {
    const data = {
      '업체이름' : '테스트업체',
      '이름' : '테스트이름',
      '캠페인이름': '테스트캠페인',
      '이용일자': '2021-10-10',
      '인원': '10',
      '채널주소': 'https://www.naver.com',

      '자동신청마감시간' : '2021-10-10 10:10:10',
      '캠페인페이지승인링크' : 'https://www.naver.com',
    }
    return this.apiplexService.sendPartnerAlimtalk('djgoak25gpd0' , data , 144);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apiplexService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApiplexDto: UpdateApiplexDto) {
    return this.apiplexService.update(+id, updateApiplexDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiplexService.remove(+id);
  }
}
