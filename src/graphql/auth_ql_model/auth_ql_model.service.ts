import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {LoginInput} from './dto/loginInput';
import {MembersService} from '../member_model/member.service';
import {compareSync} from "bcrypt";
import * as process from 'process';
import {JwtService} from "@nestjs/jwt";
import {SignupInput} from "./dto/signupInput";
import {AES_ENCRYPT, getNowUnix, hashPassword} from "../../util/common";
import {RestClient} from "@bootpay/server-rest-client";

@Injectable()
export class AuthQlModelService {
    constructor(
        private readonly memberService: MembersService,
        private readonly jwtService: JwtService) {
    }

    async login(id: string, password: string) {
        try {
            const member = await this.memberService.findById(id);
            if (!member) {
                throw new HttpException('회원정보 없음', 404);
            }

            const hash = member.passwd.toString().replace(/^\$2y(.+)$/i, '$2a$1');
            const check: boolean = compareSync(password, hash);

            if (check) {
                const payload = {
                    idx: member.idx,
                    username: member.name,
                    memberType: member.type,
                };
                const access_token = await this.jwtService.signAsync(payload, {
                    expiresIn: process.env.JWT_EXPIRATION_TIME,
                    secret: process.env.JWT_SECRET
                });
                const refresh_token = await this.jwtService.signAsync({id: payload.idx}, {
                    expiresIn: process.env.JWT_EXPIRATION_REFRESH_TIME,
                    secret: process.env.JWT_SECRET
                });
                return {
                    message: '로그인 성공',
                    access_token: access_token,
                    refresh_token: refresh_token,
                };
            } else {
                throw new HttpException('로그인 실패', 404);
            }

        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async signup(data:any) {
        try{
            const member = await this.memberService.findById(data.id);
            if (member) {
                throw new HttpException('이미 회원정보가 있습니다.', HttpStatus.CONFLICT);
            }

            // 비밀번호 암호화
            data = {
                id: `"${data.id}"`,
                passwd: `"${await hashPassword(data.password)}"`,
                name: AES_ENCRYPT(data.name),
                nickname: data.nickname,
                email: AES_ENCRYPT(data.email),
                phone: AES_ENCRYPT(data.phone),
                level: 1,
                type: 9,
                regdate:  getNowUnix(),
                lastSignin:  getNowUnix(),
            }
            const newMember = await this.memberService.create(data);

        }catch (error) {
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
        }catch (error) {
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

        if(tokenData.status !== 200) {
            throw new HttpException('AccessToken을 가져오는데 실패하였습니다.', Number(tokenData.status));
        }
        const data = await RestClient.certificate(receipt_id)

        if(data.status !== 200) {
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
            const data = await this.memberService.findByPhone(phone,username);
            console.log("-> data", data.idx);
            const channel = await this.memberService.findChannel(data.idx);
            console.log("-> channel", channel);
            data.memberChannel = channel;

            if(data) {
                return data
            }
        }catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async getMemberInfo(id: string) {
        try{
            const data = await this.memberService.findById(id);

            const channel = await this.memberService.findChannel(data.idx);

            const review = await this.memberService.findReview(data.idx);
            console.log("-> review", review);

            data.memberChannel = channel;
            data.campaignReview = review;

            if(data) {
                return data
            }
        }catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }
}
