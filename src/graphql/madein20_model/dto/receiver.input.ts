import {Field, Int, ArgsType, InputType} from '@nestjs/graphql'

@InputType()
export class ReceiverInput {
    @Field()
    name: string;

    @Field()
    phone: string;

    @Field({nullable: true})
    templateCode?: string;
}
