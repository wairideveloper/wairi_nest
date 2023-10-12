import {Field, Int, ArgsType, InputType} from '@nestjs/graphql'
import {IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, validate} from 'class-validator';

@ArgsType()
export class FirebaseInput {
    @Field()
    @IsNotEmpty({message:'token을 입력해 주세요'})
    token: string;

    @Field()
    title: string;

    @Field()
    body: string;
}
