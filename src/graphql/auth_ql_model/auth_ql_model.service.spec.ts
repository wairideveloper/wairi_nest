import { Test, TestingModule } from '@nestjs/testing';
import { AuthQlModelService } from './auth_ql_model.service';

describe('AuthQlModelService', () => {
  let service: AuthQlModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthQlModelService],
    }).compile();

    service = module.get<AuthQlModelService>(AuthQlModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
