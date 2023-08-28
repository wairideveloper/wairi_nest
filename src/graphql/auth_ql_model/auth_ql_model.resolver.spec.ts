import { Test, TestingModule } from '@nestjs/testing';
import { AuthQlModelResolver } from './auth_ql_model.resolver';
import { AuthQlModelService } from './auth_ql_model.service';

describe('AuthQlModelResolver', () => {
  let resolver: AuthQlModelResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthQlModelResolver, AuthQlModelService],
    }).compile();

    resolver = module.get<AuthQlModelResolver>(AuthQlModelResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
