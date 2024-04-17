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
    return this.apiplexService.sendPartnerAlimtalk('djgoak25gpd0' , {} , 144);
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
