import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import {AuthQlModelService} from './auth_ql_model.service';
import {LoginResponse} from "./dto/login-response";
import {SignupResponse} from "./dto/signup-response";
import {LoginInput} from "./dto/loginInput";
import {SignupInput} from "./dto/signupInput";
import {PartnerSignupInput} from "./dto/partnerSignupInput";
import {ChangePasswordInput} from "./dto/changePasswordInput";
import {Logger, UseGuards} from '@nestjs/common';
import {customLogger} from "../../util/common";
import {GqlAuthGuard} from "../../auth/GqlAuthGuard";
import {AuthUser} from "../../auth/auth-user.decorator";
import {Member} from "../../../entity/entities/Member";
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

    @Mutation(() => SignupResponse)
    async signup(@Args('signupInput') signupInput: SignupInput) {
        try {
            const data = {
                type: signupInput.type,
                id: signupInput.id,
                password: signupInput.password,
                // name: signupInput.name,
                // nickname: signupInput.nickname,
                email: signupInput.email,
                // phone: signupInput.phone,
                // receipt_id: signupInput.receipt_id,
                // unique: signupInput.unique,
                // di: signupInput.di,
                // birth: signupInput.birth,
                // gender: signupInput.gender,
                refererRoot: signupInput.refererRoot,
                refererRootInput: signupInput.refererRootInput,
                // channelType: signupInput.channelType,
                // link: signupInput.link,
                agree: signupInput.agree,
            }
            console.log("-> data", data);
            return await this.authQlModelService.signup(data);
        } catch (error) {
            customLogger(this.logger, signupInput, error);
            throw error;
        }
    }

    @Mutation(() => SignupResponse)
    async partnerSignup(@Args('partnerSignupInput') partnerSignupInput: PartnerSignupInput) {
        try {
            const data = {
                id: partnerSignupInput.id,
                password: partnerSignupInput.password,
                corpName: partnerSignupInput.corpName,
                corpCeo: partnerSignupInput.corpCeo,
                corpTel: partnerSignupInput.corpTel,
                attachBiz: partnerSignupInput.attachBiz,
                contactName: partnerSignupInput.contactName,
                contactPhone: partnerSignupInput.contactPhone,
                contactEmail: partnerSignupInput.contactEmail,
            }
            return await this.authQlModelService.partnerSignup(data);

        }catch (error) {
            customLogger(this.logger, partnerSignupInput, error);
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

    @Query(() => String)
    @UseGuards(GqlAuthGuard)
    async identityVerificationV2(
        @Args({name: 'receipt_id', type: () => String}) receipt_id: string,
        @AuthUser() authUser: Member) {
        try {
            console.log("=>(auth_ql_model.resolver.ts:110) authUser", authUser);
            return await this.authQlModelService.identityVerificationV2(receipt_id, authUser.idx);
        } catch (error) {
            customLogger(this.logger, receipt_id, error);
            throw error;
        }
    }

    @Query(() => String)
    @UseGuards(GqlAuthGuard)
    async reVerifyPhoneV2(
        @Args({name: 'receipt_id', type: () => String}) receipt_id: string,
        @AuthUser() authUser: Member
    ){
        try {
            return await this.authQlModelService.reVerifyPhoneV2(receipt_id, authUser.idx);
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
