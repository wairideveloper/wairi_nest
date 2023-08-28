import { Test, TestingModule } from '@nestjs/testing';
import { AuthQlResolver } from './auth_ql.resolver';
import { AuthQlService } from './auth_ql.service';

describe('AuthQlResolver', () => {
  let resolver: AuthQlResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthQlResolver, AuthQlService],
    }).compile();

    resolver = module.get<AuthQlResolver>(AuthQlResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
