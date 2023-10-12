import {Field, Int, ArgsType, InputType} from '@nestjs/graphql'

@InputType()
export class ChannelInput {
    @Field()
    name: string;

    @Field()
    url: string;

    @Field({nullable: true})
    followers?: number;

    @Field({nullable: true})
    follow?: number;
}
