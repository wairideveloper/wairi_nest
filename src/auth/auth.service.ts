import {HttpException, Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {CreateAuthDto} from './dto/create-auth.dto';
import {UpdateAuthDto} from './dto/update-auth.dto';
import {InjectRepository} from '@nestjs/typeorm';
import {Member} from '../../entity/entities/Member';
import {Repository} from 'typeorm';
import {MembersService} from '../members/members.service';
import {compareSync, genSaltSync, hashSync} from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import * as process from 'process';
import {AES_ENCRYPT, getNowUnix, hashPassword} from "../util/common";

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        private readonly memberService: MembersService,
        private jwtService: JwtService,
    ) {
    }

    async login(email: string, passwd: string) {
        const member = await this.memberService.findByEmail(email);
        console.log(member)
        if (!member) {
            return {
                message: '회원정보 없음',
            };
        }
        const hash = member.passwd.toString().replace(/^\$2y(.+)$/i, '$2a$1');
        const check: boolean = compareSync(passwd, hash);

        const payload = {
            idx: member.idx,
            username: member.name,
            memberType: member.type,
        };
        console.log("-> member.type", member.type);
        console.log(payload)
        if (check) {
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
            return {
                message: '로그인 실패',
            };
        }
    }

    //토큰 재발급 refresh
    async refreshToken(refresh_token: string) {
        // JWT Refresh Token 검증 로직
        const decodedRefreshToken = this.jwtService.verify(refresh_token, {secret: process.env.JWT_REFRESH_SECRET});

        // // Check if user exists
        // const userId = decodedRefreshToken.id;
        // const member = await this.memberService.getUserIfRefreshTokenMatches(idx);
        // if (!member) {
        //     throw new UnauthorizedException('Invalid user!');
        // }
        // const payload = {
        //     idx: member.idx,
        //     username: member.name,
        //     memberType: member.type,
        // };
        // // Generate new access token
        // const access_token = await this.jwtService.signAsync(payload, {
        //     expiresIn: process.env.JWT_EXPIRATION_TIME,
        //     secret: process.env.JWT_SECRET
        // });
        //
        // return {
        //     message: '토큰 재발급 성공',
        //     access_token: access_token,
        //     refresh_token: refresh_token,
        // };
    }

    async create(createAuthDto: CreateAuthDto) {
        try {
            const {id, email, name, phone, passwd} = createAuthDto;
            const hash = await this.passwordHash(passwd);

            if (await this.emailDuplicateCheck(email)) {
                this.logger.debug('이메일 중복!!!');
                return;
            }

            const user = await this.memberRepository
                .createQueryBuilder()
                .insert()
                // .into(Member, ['id', 'email', 'name', 'passwd'])
                .values({
                    id: () => id,
                    email: () => `HEX(AES_ENCRYPT("${email}","@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6"))`,
                    name: () => `HEX(AES_ENCRYPT("${name}","@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6"))`,
                    phone: () => `HEX(AES_ENCRYPT("${phone}","@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6"))`,

                    passwd: () => `"${hash}"`,
                    level: 1,
                })
                // .getSql();
                .execute();
            return user;
        } catch (e) {
            console.log(e);
        }
    }

    async kakaoLogin(user: any) {
        console.log("-> 카카오 유저 정보: ", user);
        try {
            // const memberCheck = await this.memberService.findByEmail(user.email);
            const memberCheck = await this.memberService.findSocialId(user.email, user.id, 'social_kakao');
            const passwd = await hashPassword(user.id.toString());

            if (memberCheck) {
                console.log("-> memberCheck", memberCheck);

                const payload = {
                    idx: user.idx,
                    username: user.name,
                    memberType: 1
                }
                const result = await this.jwtResponse(payload, memberCheck);
                return result;
            } else {
                const now = getNowUnix();
                // 회원 닉네임 난수 생성
                const nickname = `user_${Math.floor(Math.random() * 1000000)}`;

                const memberInsert = await this.memberRepository
                    .createQueryBuilder()
                    .insert()
                    .into(Member, ['id', 'social_kakao', 'type', 'level', 'status', 'social_type', 'nickname', 'email',
                        'phone', 'name', 'passwd', 'regdate',
                    ])
                    .values({
                        id: () => user.id,
                        social_kakao: () => user.id,
                        type: 1,
                        level: 0,
                        status: 4,
                        social_type: 'kakao',
                        nickname: () => user.profile.displayName == '닉네임을 등록해주세요' ? `"${nickname}"` : `"${user.profile.displayName}"`,
                        email: () => AES_ENCRYPT(user.email),
                        phone: () => user.phone ? AES_ENCRYPT(user.phone) : AES_ENCRYPT(""),
                        name: () => user.name == '닉네임을 등록해주세요' ? AES_ENCRYPT("") : AES_ENCRYPT(user.name),
                        passwd: () => `"${passwd}"`,
                        regdate: () => `"${now}"`,
                    })
                    .execute();
                if (memberInsert) {
                    const member = await this.memberService.findById(user.id);
                    const payload = {
                        idx: member.idx,
                        username: member.name,
                        memberType: 1
                    }
                    const result = await this.jwtResponse(payload, member);
                    return result;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async naverLogin(user:any) {
        try{
            const passwd = await hashPassword(user.id.toString());
            // const memberCheck = await this.memberService.findByEmail(user.email);
            const memberCheck = await this.memberService.findSocialId(user.email, user.id, 'social_naver');
            if(memberCheck) {
                const payload = {
                    idx: memberCheck.idx,
                    username: user.name,
                    memberType: 1
                }
                const result = await this.jwtResponse(payload, memberCheck);
                console.log("-> result", result);
                return result;
            }else{
                const now = getNowUnix();
                // 회원 닉네임 난수 생성
                const nickname = `user_${Math.floor(Math.random() * 1000000)}`;
                const memberInsert = await this.memberRepository
                    .createQueryBuilder()
                    .insert()
                    .into(Member, ['id', 'social_naver', 'type', 'level', 'status', 'social_type', 'nickname', 'email',
                        'phone', 'name', 'passwd', 'regdate',
                    ])
                    .values({
                        id: () => `"${user.id}"`,
                        social_naver: () => `"${user.id}"`,
                        type: 1,
                        level: 0,
                        status: 4,
                        social_type: 'naver',
                        nickname: () => user.profile.displayName == '닉네임을 등록해주세요' ? `"${nickname}"` : `"${user.profile.displayName}"`,
                        email: () => AES_ENCRYPT(user.email),
                        phone: () => user.phone ? AES_ENCRYPT(user.phone) : AES_ENCRYPT(""),
                        name: () => user.name == '닉네임을 등록해주세요' ? AES_ENCRYPT("") : AES_ENCRYPT(user.name),
                        passwd: () => `"${passwd}"`,
                        regdate: () => `"${now}"`,
                    })
                    .execute();
                if (memberInsert) {
                    const member = await this.memberService.findById(user.id);
                    const payload = {
                        idx: member.idx,
                        username: member.name,
                        memberType: 1
                    }
                    const result = await this.jwtResponse(payload, member);
                    return result;
                }
            }
        }catch (error) {
            console.log(error);
        }
    }

    async googleLogin(user: any) {
        try {
            const memberCheck = await this.memberService.findSocialId(user.email, user.id, 'social_google');
            const passwd = await hashPassword(user.id.toString());

            if (memberCheck) {
                const hash = memberCheck.passwd.toString().replace(/^\$2y(.+)$/i, '$2a$1');
                const check: boolean = compareSync(passwd, hash);
                console.log("=>(auth.service.ts:246) check", check);

                const payload = {
                    idx: memberCheck.idx,
                    username: user.displayName,
                    memberType: 1
                }
                const result = await this.jwtResponse(payload, memberCheck);
                console.log("-> result", result);
                return result;
            } else {
                const now = getNowUnix();
                // 회원 닉네임 난수 생성
                const nickname = `user_${Math.floor(Math.random() * 1000000)}`;
                const memberInsert = await this.memberRepository
                    .createQueryBuilder()
                    .insert()
                    .into(Member, ['id', 'social_google', 'type', 'level', 'status', 'social_type', 'nickname', 'email',
                        'phone', 'name', 'passwd', 'regdate',
                    ])
                    .values({
                        id: () => `"${user.id}"`,
                        social_google: () => `"${user.id}"`,
                        type: 1,
                        level: 0,
                        status: 4,
                        social_type: 'google',
                        nickname: () => user.displayName == '닉네임을 등록해주세요' ? `"${nickname}"
                         ` : `"${user.displayName}"`,
                        email: () => AES_ENCRYPT(user.email),
                        phone: () => user.phone ? AES_ENCRYPT(user.phone) : AES_ENCRYPT(""),
                        name: () => user.name == '닉네임을 등록해주세요' ? AES_ENCRYPT("") : AES_ENCRYPT(user.name),
                        passwd: () => `"${passwd}"`,
                        regdate: () => `"${now}"`,
                    })
                    .execute();
                if (memberInsert) {
                    const member = await this.memberService.findById(user.id);
                    const payload = {
                        idx: member.idx,
                        username: member.name,
                        memberType: 1
                    }
                    const result = await this.jwtResponse(payload, member);
                    return result;
                } else {

                }
            }
        }catch (error) {
            console.log(error);
        }
    }

    async appleLogin(user) {
        try{
            console.log("=>(auth.service.ts:305) user", user);
        }catch (error) {
            console.log(error);
            throw new HttpException(error.message, error.status)
        }
    }

    async passwordHash(passwd: string) {
        const salt = genSaltSync(5, 'a');
        let hash = hashSync(passwd, salt);
        hash = hash.replace(/^\$2a(.+)$/i, '$2y$1');
        console.log(hash);
        return hash;
    }

    async emailDuplicateCheck(email: string) {
        const member = await this.memberService.findByEmail(email);
        return member;
        if (member) {
            return true;
        } else {
            return false;
        }
    }

    OAuthLogin(param: { res: Response; req: Request }) {

    }

    OAuthCallback(user) {
        console.log('test')
        console.log(user)
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
}
