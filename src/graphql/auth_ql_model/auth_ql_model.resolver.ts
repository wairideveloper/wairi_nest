import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import {AuthQlModelService} from './auth_ql_model.service';
import {LoginResponse} from "./dto/login-response";
import {LoginInput} from "./dto/loginInput";
import {SignupInput} from "./dto/signupInput";
import {ChangePasswordInput} from "./dto/changePasswordInput";
import {Logger} from '@nestjs/common';
import {customLogger} from "../../util/common";
@Resolver('AuthQlModel')
export class AuthQlModelResolver {
    private readonly logger = new Logger();

    constructor(private readonly authQlModelService: AuthQlModelService) {
    }

    @Mutation(() => LoginResponse)
    async login(@Args('loginInput',) loginInput: LoginInput) {
        try {
            return await this.authQlModelService.login(loginInput.id, loginInput.password);
        } catch (error) {
            customLogger(this.logger, loginInput, error);
            throw error;
        }
    }

    @Mutation(() => LoginResponse)
    async signup(@Args('signupInput') signupInput: SignupInput) {
        try {
            const data = {
                id: signupInput.id,
                password: signupInput.password,
                name: 'name',
                nickname: signupInput.nickname,
                email: signupInput.email,
                phone: signupInput.phone,
                receipt_id: signupInput.receipt_id,
                agree: signupInput.agree,
            }
            return await this.authQlModelService.signup(data);
        } catch (error) {
            customLogger(this.logger, signupInput, error);
            throw error;
        }
    }

    @Mutation(() => LoginResponse)
    async getAccessToken(@Args({name: 'refresh_token', type: () => String}) refresh_token: string) {
        try {
            return await this.authQlModelService.getAccessToken(refresh_token);
        } catch (error) {
            customLogger(this.logger, refresh_token, error);
            throw error;
        }
    }

    @Query(() => String)
    async identityVerification(@Args({name: 'receipt_id', type: () => String}) receipt_id: string) {
        try {
            return await this.authQlModelService.identityVerification(receipt_id);
        } catch (error) {
            customLogger(this.logger, receipt_id, error);
            throw error;
        }
    }

    /*
     본인인증 후 아이디 찾기
        params: phone, username
     */
    @Query(() => String)
    async findId(@Args({name: 'phone', type: () => String}) phone: string,
                 @Args({name: 'username', type: () => String}) username: string
    ) {
        try {
            return await this.authQlModelService.findId(phone, username);
        } catch (error) {
            customLogger(this.logger, phone, error);
            throw error;
        }
    }

    /*
     본인인증 후 비밀번호 변경
        params: phone, username
     */
    @Mutation(() => String)
    async changePassword(@Args('changePasswordInput') changePasswordInput: ChangePasswordInput) {
        try {
            const data = {
                password: changePasswordInput.password,
                username: changePasswordInput.username,
                phone: changePasswordInput.phone,
            }
            return await this.authQlModelService.changePassword(data);
        }   catch (error) {
            customLogger(this.logger, changePasswordInput, error);
            throw error;
        }
    }


    @Query(() => String)
    async getMemberInfo(@Args({name: 'id', type: () => String}) id: string) {
        try {

            return await this.authQlModelService.getMemberInfo(id);
        } catch (error) {
            customLogger(this.logger, id, error);
            throw error;
        }
    }

    @Query(() => String)
    async getSnsChannel() {
        try {
            return await this.authQlModelService.getSnsChannel();
        } catch (error) {
            customLogger(this.logger, '', error);
            throw error;
        }
    }

    @Query(() => String)
    async getSubscriptionPath() {
        try {
            return await this.authQlModelService.getSubscriptionPath();
        } catch (error) {
            customLogger(this.logger, '', error);
            throw error;
        }
    }

}
