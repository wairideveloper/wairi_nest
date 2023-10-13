import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import { FirebaseService } from './firebase.service';
import {FirebaseInput} from "./dto/firebaseInput";
@Resolver('Firebase')
export class FirebaseResolver {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Mutation(() => String)
    async firebaseTest(
        @Args('firebaseInput') firebaseInput: FirebaseInput,
  ) {
    console.log("=>(firebase.resolver.ts:13) FirebaseInput", FirebaseInput);
        return await this.firebaseService.firebaseTest();
  }
}
