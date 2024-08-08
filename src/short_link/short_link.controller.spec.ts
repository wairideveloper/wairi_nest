import { Test, TestingModule } from '@nestjs/testing';
import { ShortLinkController } from './short_link.controller';
import { ShortLinkService } from './short_link.service';

describe('ShortLinkController', () => {
  let controller: ShortLinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortLinkController],
      providers: [ShortLinkService],
    }).compile();

    controller = module.get<ShortLinkController>(ShortLinkController);
  });
});
