import { Test, TestingModule } from '@nestjs/testing';
import { ShortLinkService } from './short_link.service';

describe('ShortLinkService', () => {
  let service: ShortLinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShortLinkService],
    }).compile();

    service = module.get<ShortLinkService>(ShortLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
