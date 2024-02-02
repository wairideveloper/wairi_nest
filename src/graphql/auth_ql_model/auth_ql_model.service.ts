import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {LoginInput} from './dto/loginInput';
import {MembersService} from '../member_model/member.service';
import {Partner} from "../../../entity/entities/Partner";
import {Withdrawal} from "../../../entity/entities/Withdrawal";
import {Member} from "../../../entity/entities/Member";
import {compareSync} from "bcrypt";
import * as process from 'process';
import {JwtService} from "@nestjs/jwt";
import {SignupInput} from "./dto/signupInput";
import * as amplitude from '@amplitude/analytics-node';
import {
    AES_DECRYPT,
    AES_ENCRYPT, bufferToString,
    changeInterestsText,
    FROM_UNIXTIME,
    FROM_UNIXTIME_JS,
    getNowUnix,
    hashPassword, randomString
} from "../../util/common";
import {RestClient} from "@bootpay/server-rest-client";
import {Bootpay} from '@bootpay/backend-js'
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Connection} from "typeorm";
import * as admin from 'firebase-admin';
import {ServiceAccount} from "firebase-admin";
import * as moment from "moment";
import {Madein20ModelService} from "../madein20_model/madein20_model.service";
import {ApiplexService} from "../apiplex/apiplex.service";

@Injectable()
export class AuthQlModelService {
    constructor(
        @InjectRepository(Partner)
        private partnerRepository: Repository<Partner>,
        @InjectRepository(Withdrawal)
        private withdrawalRepository: Repository<Withdrawal>,
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        private readonly memberService: MembersService,
        private readonly jwtService: JwtService,
        private readonly connection: Connection,
        private readonly madein20ModelService: Madein20ModelService,
        private readonly apiPlexService: ApiplexService,
        ) {
    }

    async login(id: string, password: string) {
        try {
            let member = await this.memberService.findByIdSecession(id);
            member = bufferToString(member);
            if (!member) {
                throw new HttpException('회원정보 없음', 404);
            }

            console.log("=>(auth_ql_model.service.ts:52) member", member);
            const hash = member.passwd.toString().replace(/^\$2y(.+)$/i, '$2a$1');
            const check: boolean = compareSync(password, hash);

            if (check) {
                const payload = {
                    idx: member.idx,
                    username: member.name,
                    memberType: member.type,
                    phone: member.phone,
                    is_black: member.is_black,
                };
                const access_token = await this.jwtService.signAsync(payload, {
                    expiresIn: process.env.JWT_EXPIRATION_TIME,
                    secret: process.env.JWT_SECRET
                });
                const refresh_token = await this.jwtService.signAsync({id: payload.idx}, {
                    expiresIn: process.env.JWT_EXPIRATION_REFRESH_TIME,
                    secret: process.env.JWT_SECRET
                });
                console.log("-> member.idx", member.idx);
                let memberChannel = await this.memberService.findChannel(member.idx);
                memberChannel = bufferToString(memberChannel);

                //array memberChannel.regdate 변환
                memberChannel = memberChannel.map((item, index) => {
                    memberChannel[index].date = FROM_UNIXTIME_JS(item.regdate).toString();
                    memberChannel[index].interests = changeInterestsText(item.interests);
                    return memberChannel[index];
                })
                member.memberChannel = memberChannel;
                console.log("=>(auth_ql_model.service.ts:80) member", member);

                //lastSignin update
                await this.memberService.updateLastSignin(member.idx);

                return {
                    message: '로그인 성공',
                    access_token: access_token,
                    refresh_token: refresh_token,
                    member: member
                };
            } else {
                throw new HttpException('로그인 실패', 404);
            }

        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async signup(data: any) {
        //transaction 처리
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const member = await this.memberService.findById(data.id);
            console.log("=>(auth_ql_model.service.ts:104) member", member);
            if (member) {
                throw new HttpException('이미 회원정보가 있습니다.', HttpStatus.CONFLICT);
            }
            if(data.refererRoot == 4 || data.refererRoot == 9){
                if(!data.refererRootInput){
                    throw new HttpException('필수 입력값 누락.', HttpStatus.CONFLICT);
                }
                if(data.refererRoot == 4){
                    // 추천인 코드 확인
                    let member = await this.memberService.findByRecommend(data.refererRootInput);
                    if(!member){
                        throw new HttpException('일치하는 추천인 코드가 없습니다.', 404);
                    } else if(member.status == -9){
                        throw new HttpException('탈퇴한 추천인 코드입니다.', 404);
                    }
                }
            }
            //Todo 추천인 코드 생성
            const code = await this.createRecommendCode();
            data = {
                type: data.type,
                id: `"${data.id}"`,
                passwd: `"${await hashPassword(data.password)}"`, // 비밀번호 암호화
                // name: AES_ENCRYPT(data.name),
                // nickname: data.nickname,
                email: AES_ENCRYPT(data.email),
                // phone: AES_ENCRYPT(data.phone),
                // ci: data.unique ? data.unique : null,
                // di: data.di ? data.di : null,
                // birth: data.birth ? data.birth : 0,
                // gender: data.gender ? (data.gender == 1 ? 'm' : 'f') : "",
                refererRoot: data.refererRoot ? data.refererRoot : 0,
                refererRootInput: data.refererRootInput ? data.refererRootInput : "",
                // channelType: data.channelType,
                // link: data.link,
                agree: data.agree,
                level: 1,
                status: 1,
                regdate: getNowUnix(),
                lastSignin: getNowUnix(),
                code: `${code}` // 개인 추천코드 생성
            }

            const newMember = await this.memberService.create(data);
            const channelType = data.channelType;
            const link = data.link;

            //채널정보가 있을경우
            //Todo: 회원가입 입력관련 체크
            // if (channelType && link) {
            //     const channel = await this.memberService.checkChannelType(channelType,newMember.generatedMaps[0].idx);
            //     if (!channel) {
            //         const channelData = {
            //             memberIdx: newMember.generatedMaps[0].idx,
            //             type: channelType,
            //             link: link,
            //             regdate: getNowUnix(),
            //             level: 0,
            //         }
            //         const newChannel = await this.memberService.createChannel(channelData);
            //         console.log("-> newChannel", newChannel);
            //     }else{
            //         throw new HttpException('이미 채널정보가 있습니다.', HttpStatus.CONFLICT);
            //     }
            // }

            if (newMember) {
                let result = await this.memberService.findById(newMember.generatedMaps[0].id);
                result = bufferToString(result);
                console.log("=>(auth_ql_model.service.ts:148) result", result);
                const payload = {
                    idx: result.idx,
                    username: result.name,
                    memberType: result.type,
                };
                const access_token = await this.jwtService.signAsync(payload, {
                    expiresIn: process.env.JWT_EXPIRATION_TIME,
                    secret: process.env.JWT_SECRET
                });
                const refresh_token = await this.jwtService.signAsync({id: payload.idx}, {
                    expiresIn: process.env.JWT_EXPIRATION_REFRESH_TIME,
                    secret: process.env.JWT_SECRET
                });
                // let identityVerification = 'N';
                // if(member.ci) {
                //     identityVerification = 'Y';
                // }

                await queryRunner.commitTransaction();

                //관리자 알림톡 전송
                // await this.madein20ModelService.sendManagerAlimtalk(data, 'test','EHu0hjNSYvP3y0ZSxSd2');

                //회원 알림톡 발송
                //Todo amplitude
                amplitude.init('a5731a043c47edc8f0cacd0f724385d9'); // dev
                const eventProperties = {
                    accout_type: 'email',
                };
                const test =  amplitude.track('account created', eventProperties, {
                    device_id: 'wairi',
                });

                return {
                    message: '회원가입 성공',
                    access_token: access_token,
                    refresh_token: refresh_token,
                    // identityVerification: identityVerification,
                    data: result,
                };
            }else {
                await queryRunner.rollbackTransaction();
                throw new HttpException('회원가입에 실패하였습니다.', HttpStatus.CONFLICT);

            }

        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw new HttpException(error.message, error.status);
        } finally {
            await queryRunner.release();
        }
    }

    async partnerSignup(data: any) {
        try {
            const partner = await this.partnerRepository.findOne({where: {id: data.id}});
            if (partner) {
                throw new HttpException('이미 회원정보가 있습니다.', HttpStatus.CONFLICT);
            }

            data = {
                id: `"${data.id}"`,
                passwd: `"${await hashPassword(data.password)}"`, // 비밀번호 암호화
                status: 4,
                corpName: data.corpName,
                corpCeo: data.corpCeo,
                corpTel: data.corpTel,
                attachBiz: data.attachBiz,
                contactName: AES_ENCRYPT(data.contactName),
                contactPhone: AES_ENCRYPT(data.contactPhone),
                contactEmail: AES_ENCRYPT(data.contactEmail),
                regdate: getNowUnix(),
            }

            const newPartner = await this.partnerRepository
                .createQueryBuilder()
                .insert()
                .into(Partner, [
                    'id',
                    'passwd',
                    'status',
                    'corpName',
                    'corpCeo',
                    'corpTel',
                    'attachBiz',
                    'contactName',
                    'contactPhone',
                    'contactEmail',
                    'regdate'
                ])
                .values({
                    id: () => data.id,
                    passwd: () => data.passwd,
                    status: () => data.status,
                    corpName: () => `"${data.corpName}"`,
                    corpCeo: () => `"${data.corpCeo}"`,
                    corpTel: () => data.corpTel,
                    attachBiz: () => `"${data.attachBiz}"`,
                    contactName: () => data.contactName,
                    contactPhone: () => data.contactPhone,
                    contactEmail: () => data.contactEmail,
                    regdate: () => data.regdate
                }).execute()
            if(newPartner){
                const result = await this.partnerRepository
                    .createQueryBuilder()
                    .select('*')
                    .addSelect(`(${AES_DECRYPT('contactName')})`, 'contactName')
                    .addSelect(`(${AES_DECRYPT('contactPhone')})`, 'contactPhone')
                    .addSelect(`(${AES_DECRYPT('contactEmail')})`, 'contactEmail')
                    .addSelect(`(${FROM_UNIXTIME('regdate')})`, 'regdate')
                    .addSelect(`(${FROM_UNIXTIME('lastSignin')})`, 'lastSignin')
                    .where('idx = :idx', {idx: newPartner.raw.insertId})
                    .getRawOne();
                const payload = {
                    idx: result.idx,
                    username: result.name,
                    memberType: result.type,
                };
                const access_token = await this.jwtService.signAsync(payload, {
                    expiresIn: process.env.JWT_EXPIRATION_TIME,
                    secret: process.env.JWT_SECRET
                });
                const refresh_token = await this.jwtService.signAsync({id: payload.idx}, {
                    expiresIn: process.env.JWT_EXPIRATION_REFRESH_TIME,
                    secret: process.env.JWT_SECRET
                });
                console.log("-> result", result);
                return {
                    message: '파트너 등록 성공',
                    access_token: access_token,
                    refresh_token: refresh_token,
                    data: result,
                }
            }else{
                throw new HttpException('파트너 등록에 실패하였습니다.', HttpStatus.CONFLICT);
            }


        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async getAccessToken(refresh_token: string) {
        try {
            const decodedToken = await this.jwtService.verifyAsync(refresh_token, {
                secret: process.env.JWT_SECRET,
            });
            const payload = {
                idx: decodedToken.idx,
                username: decodedToken.username,
                memberType: decodedToken.memberType,
            };
            const access_token = await this.jwtService.signAsync(payload, {
                expiresIn: process.env.JWT_EXPIRATION_TIME,
                secret: process.env.JWT_SECRET
            });
            return {
                message: '토큰 발급 성공',
                access_token: access_token,
            };
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }

    }

    async identityVerificationV2(receipt_id: string, memberIdx: number)
    {
        Bootpay.setConfiguration({
            application_id: '6143fb797b5ba4002152b6e1',
            private_key: 'RQ/RYIauHAVJZ8jkKggH6o3EIKKNnviRcGXN4hPNjiM='
        })

        try {
            await Bootpay.getAccessToken()
            const data = await Bootpay.certificate(receipt_id)
            console.log("=>(auth_ql_model.service.ts:316) data", data);
            console.log(data.authenticate_data['di'])
            if(data){
                let checkUnique = await this.memberService.checkUnique(data.authenticate_data.unique);
                if(checkUnique){
                    throw new HttpException('이미 등록된 본인인증 정보입니다.', 404);
                }

                const update = await this.memberService.updateUnique(
                    memberIdx,
                    data.authenticate_data.unique,
                    data.authenticate_data['di'],
                    data.authenticate_data.phone,
                    data.authenticate_data.name,
                    )

                return {
                    message: '본인인증 성공',
                    data: data,
                }
            }else{
                throw new HttpException('본인인증 실패', 404);
            }

        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async identityVerificationFindV2(receipt_id: string) {
        Bootpay.setConfiguration({
            application_id: '6143fb797b5ba4002152b6e1',
            private_key: 'RQ/RYIauHAVJZ8jkKggH6o3EIKKNnviRcGXN4hPNjiM='
        })

        try {
            await Bootpay.getAccessToken()
            const data = await Bootpay.certificate(receipt_id)
            console.log("=>(auth_ql_model.service.ts:352) data", data);
            if(data){
                let checkUnique = await this.memberService.checkUniqueFindId(
                    data.authenticate_data.unique,
                    data.authenticate_data.phone,
                    data.authenticate_data.name
                );
                if(!checkUnique){
                    throw new HttpException('본인인증 등록된 계정이 없습니다.', 404);
                }
                checkUnique.regdate = moment.unix(checkUnique.regdate).format('YYYY-MM-DD HH:mm:ss');
                checkUnique = bufferToString(checkUnique);
                console.log("=>(auth_ql_model.service.ts:362) checkUnique", checkUnique);
                if(checkUnique){
                    return {
                        status: 200,
                        message: '본인인증 성공',
                        data: checkUnique,
                    }
                }else{
                    throw new HttpException('본인인증 등록된 계정이 없습니다.', 404);
                }

            }else{
                throw new HttpException('본인인증 실패', 404);
            }

        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }


    async identityVerification(receipt_id: string) {
        console.log("-> receipt_id", receipt_id);
        RestClient.setConfig(
            '6143fb797b5ba4002152b6e1',
            'RQ/RYIauHAVJZ8jkKggH6o3EIKKNnviRcGXN4hPNjiM='
        );
        const tokenData = await RestClient.getAccessToken()

        if (tokenData.status !== 200) {
            throw new HttpException('AccessToken을 가져오는데 실패하였습니다.', Number(tokenData.status));
        }
        const data = await RestClient.certificate(receipt_id)

        if (data.status !== 200) {
            throw new HttpException(data.message, Number(data.status));
        }

        return {
            message: '본인인증 성공',
            data: data.data,
        }
    }

    async findId(phone: string, username: string) {
        try {
            //본인인증 후 아이디 찾기
            let data = await this.memberService.findByPhone(phone, username);
            data = bufferToString(data);

            let channel = await this.memberService.findChannel(data.idx);
            channel = bufferToString(channel);
            data.memberChannel = channel;

            if (data) {
                return data
            }
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async getMemberInfo(id: string) {
        try {
            let data = await this.memberService.findById(id);
            data = bufferToString(data);
            if(!data){
                throw new HttpException('회원정보가 없습니다.', 404);
            }
            if(data.status == -9){
                throw new HttpException('탈퇴한 회원입니다.', 406);
            }
            console.log("=>(auth_ql_model.service.ts:433) data", data);
            let channel = await this.memberService.findChannel(data.idx);
            channel = bufferToString(channel);
            console.log("=>(auth_ql_model.service.ts:437) channel", channel);
            const review = await this.memberService.findReview(data.idx);

            data.memberChannel = channel;
            data.campaignReview = review;

            if (data) {
                return data
            }
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async checkNickName(nickname: string) {
        try {
            const data = await this.memberService.findByNickName(nickname);
            if (data) {
                return data
            }
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async changePassword(data: any) {
        try {
            //본인인증 후 비밀번호 변경
            // let member = await this.memberService.findByPhoneAndId(data.phone, data.username, data.id);
            let member = await this.memberService.findByPhone(data.phone, data.username);
            member = bufferToString(member);
            const password = await hashPassword(data.password);
            let update = await this.memberService.updatePassword(member.idx, password);
            if (update) {
                member = bufferToString(member);
                return member
            }
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async getSnsChannel() {
        const data = await this.memberService.findSnsChannel();
        // , 구분값 추출 후 배열로 변환
        const channel = data[0].cfgValue.split(',');
        // channel 배열 원소를 ['text' => channel[i]]로 변환
        const channelText = channel.map((item) => {
            return {text: item}
        })
        return channelText;
    }

    async getSubscriptionPath() {
        const data = await this.memberService.findSubscriptionPath();
        // , 구분값 추출 후 배열로 변환
        const path = data[0].cfgValue.split(',');
        // channel 배열 원소를 ['text' => channel[i]]로 변환
        const pathText = path.map((item) => {
            return {text: item}
        })
        return pathText;
    }

    async reVerifyPhoneV2(receipt_id: string, memberIdx: number) {
        Bootpay.setConfiguration({
            application_id: '6143fb797b5ba4002152b6e1',
            private_key: 'RQ/RYIauHAVJZ8jkKggH6o3EIKKNnviRcGXN4hPNjiM='
        })
        try {
            await Bootpay.getAccessToken()
            const data = await Bootpay.certificate(receipt_id)
            console.log(data.authenticate_data)
            if(data){
                let checkUnique = await this.memberService.checkUnique(data.authenticate_data.unique);
                // if(checkUnique){
                //     throw new HttpException('이미 등록된 본인인증 정보입니다.', 404);
                // }
                const update = await this.memberService.reVerifyPhoneV2(memberIdx, data.authenticate_data.unique);
                return {
                    message: '본인인증 성공',
                    data: data,
                }
            }else{
                throw new HttpException('본인인증 실패', 404);
            }

        } catch (e) {
            console.log(e)
        }
    }

    async changeMemberInfo(data: {
        memberIdx: number;
        // phone: string;
        nickname: string;
        email: string}) {
        try {
            let member = await this.memberService.findOne(data.memberIdx);
            if(!member){
                throw new HttpException('회원정보가 없습니다.', 404);
            }
            const update = await this.memberService.updateMemberInfo(member.idx, data.nickname, data.email);

            if (update) {
                //Todo apiplex 회원정보 수정
                if(member.phone){
                    let param = {
                        "이름" : member.name ? member.name : "회원",
                        "변경내용" : "닉네임 : " + data.nickname + ", 이메일 : " + data.email,
                    }
                    await this.apiPlexService.sendUserAlimtalk('kjR290Pm0Xac',member.phone, param);
                }
                //secession
                let updateMember = await this.memberService.findByIdSecession(member.id);
                updateMember = bufferToString(updateMember);
                return updateMember
            }
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async getWithdrawalReasons() {
        return await this.withdrawalRepository.createQueryBuilder("withdrawal")
            .select("withdrawal.idx", "idx")
            .addSelect("withdrawal.reason", "reason")
            .addSelect("withdrawal.use_yn", "use_yn")
            .getRawMany();
    }

    async socialSignup(data: {
        social_type: string;
        nickname: string;
        id: string;
        email: string;
        name: string;
        refererRoot: number;
        refererRootInput: string;
        agreeMsg: number;
    }) {
        try{
            /*
            1: kakao
            2: naver
            3: google
            4: apple
             */
            let memberCheck = await this.memberService.findSocialId(data.email, data.id, data.social_type);
            memberCheck = bufferToString(memberCheck);
            console.log("=>(auth_ql_model.service.ts:570) memberCheck", memberCheck);
            const passwd = await hashPassword(data.id.toString());

            if(memberCheck){
                if(memberCheck.status == -9){
                    throw new HttpException('탈퇴한 회원입니다.', 404);
                }
                memberCheck = bufferToString(memberCheck);
                const hash = memberCheck.passwd.toString().replace(/^\$2y(.+)$/i, '$2a$1');
                const check: boolean = compareSync(passwd, hash);
                console.log("=>(auth.service.ts:246) check", check);

                const payload = {
                    idx: memberCheck.idx,
                    username: data.nickname,
                    memberType: 1,
                    phone: memberCheck.phone,
                    is_black: memberCheck.is_black,
                }

                let memberChannel = await this.memberService.findChannel(memberCheck.idx);
                memberChannel = bufferToString(memberChannel);
                //array memberChannel.regdate 변환
                memberChannel = memberChannel.map((item, index) => {
                    memberChannel[index].date = FROM_UNIXTIME_JS(item.regdate).toString();
                    memberChannel[index].interests = changeInterestsText(item.interests);
                    return memberChannel[index];
                })
                memberCheck.memberChannel = memberChannel;

                //lastSignin update
                await this.memberService.updateLastSignin(memberCheck.idx);

                const result = await this.jwtResponse(payload, memberCheck);
                console.log("=>(auth_ql_model.service.ts:590) result", result);

                return result;
            }else{

                if(data.refererRoot == 4 || data.refererRoot == 9){
                    if(!data.refererRootInput){
                        throw new HttpException('필수 입력값 누락.', HttpStatus.CONFLICT);
                    }
                    if(data.refererRoot == 4){
                        // 추천인 코드 확인
                        let member = await this.memberService.findByRecommend(data.refererRootInput);
                        if(!member){
                            throw new HttpException('일치하는 추천인 코드가 없습니다.', 404);
                        }else if(member.status == -9){
                            throw new HttpException('탈퇴한 추천인 코드입니다.', 404);
                        }
                    }
                }
                //Todo 추천인 코드 생성
                const code = await this.createRecommendCode();

                console.log("=>(auth_ql_model.service.ts:611) code", code);
                let newMember = await this.memberService.createSocial(
                    data.social_type,
                    data.nickname,
                    data.id,
                    data.email,
                    data.name,
                    data.refererRoot,
                    data.refererRootInput,
                    data.agreeMsg,
                    code // 개인 추천코드 생성
                    );
                if(newMember){
                    let member = await this.memberService.findSocialId(data.email, data.id, data.social_type);
                    member = bufferToString(member);
                    const payload = {
                        idx: member.idx,
                        username: data.nickname,
                        memberType: 1
                    }
                    const result = await this.jwtResponse(payload, member);

                    //Todo amplitude
                    let social_type = '';
                    switch (data.social_type) {
                        case '1':
                            social_type = 'kakao'
                            break;
                        case '2':
                            social_type = 'naver'
                            break;
                        case '3':
                            social_type = 'google'
                            break;
                        case '4':
                            social_type = 'apple'
                            break;
                    }
                    console.log("=>(auth_ql_model.service.ts:688) social_type", social_type);
                    amplitude.init('a5731a043c47edc8f0cacd0f724385d9'); // dev
                    const eventProperties = {
                        accout_type: social_type,
                    };
                    const test =  amplitude.track('account created', eventProperties, {
                        device_id: 'wairi',
                    });

                    return result;
                }
            }

        }catch (error) {
            console.log("=>(auth_ql_model.service.ts:692) error", error);
            throw new HttpException(error.message, error.status);
        }
    }

    async jwtResponse(payload: any, data: any) {
        const access_token = await this.jwtService.signAsync(payload, {
            expiresIn: process.env.JWT_EXPIRATION_TIME,
            secret: process.env.JWT_SECRET
        })
        const refresh_token = await this.jwtService.signAsync({id: payload.idx}, {
            expiresIn: process.env.JWT_EXPIRATION_REFRESH_TIME,
            secret: process.env.JWT_SECRET
        })
        return {
            message: '로그인 성공',
            access_token: access_token,
            refresh_token: refresh_token,
            data: data
        }
    }

    async withdrawal(data: {reason: string; memberIdx: number}) {
        try{
            const withdrawal = await this.memberRepository.createQueryBuilder()
                .update()
                .set(
                    {
                        withdrawal: data.reason,
                        status: -9,
                        exitdate: getNowUnix().toString(),
                    }
                )
                .where("idx = :idx", {idx: data.memberIdx})
                .execute();

            if(withdrawal){
                return {
                    message: '회원탈퇴 성공',
                    data: withdrawal
                }
            }else{
                throw new HttpException('회원탈퇴 실패', 404);
            }
        }catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    private async createRecommendCode() {
        let code = randomString();
        let checkCode = await this.memberService.findByRecommend(code);
        console.log("=>(auth_ql_model.service.ts:747) code", code);
        console.log("=>(auth_ql_model.service.ts:747) checkCode", checkCode);
        if (checkCode) {
            await this.createRecommendCode();
        } else {
            return code;
        }
    }
}
