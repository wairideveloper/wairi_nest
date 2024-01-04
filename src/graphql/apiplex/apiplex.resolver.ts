import { Resolver, Query } from '@nestjs/graphql';
import { ApiplexService } from './apiplex.service';
@Resolver()
export class ApiplexResolver {
  constructor(private readonly apiplexService: ApiplexService) {}

  @Query()
  async testapiplex() {
    try {
      console.log("=>(apiplex.resolver.ts:11) testapiplex", 'testapiplex');
      const result = await this.apiplexService.test();
      return {
        message: '성공',
        code: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
