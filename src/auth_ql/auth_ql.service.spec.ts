import { Test, TestingModule } from '@nestjs/testing';
import { AuthQlService } from './auth_ql.service';

describe('AuthQlService', () => {
  let service: AuthQlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthQlService],
    }).compile();

    service = module.get<AuthQlService>(AuthQlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
