import { Field, Int, ArgsType } from '@nestjs/graphql'
import {IsNumber, Max, Min} from 'class-validator'

@ArgsType()
export class FetchPaginationInput {
    // @Field({ nullable: true })
    // @Min(0)
    // skip? : number

    @Field(type => Int, { nullable: true })
    skip: number;

    @Field(type => Int)
    @Min(1)
    @Max(3)
    take = 1;

    @Field({ nullable: true })
    title?: string;

    // helpers - index calculations
    get startIndex(): number {
        return this.skip;
    }
    get endIndex(): number {
        return this.skip + this.take;
    }
    // @Field({ nullable: true })
    // @Min(1)
    // @Max(2)
    // take? : number

}