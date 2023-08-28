import {Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {CreateAuthDto} from './dto/create-auth.dto';
import {UpdateAuthDto} from './dto/update-auth.dto';
import {InjectRepository} from '@nestjs/typeorm';
import {Member} from '../../entity/entities/Member';
import {Repository} from 'typeorm';
import {MembersService} from '../members/members.service';
import {compareSync, genSaltSync, hashSync} from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import * as process from 'process';

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
        const decodedRefreshToken = this.jwtService.verify(refresh_token, { secret: process.env.JWT_REFRESH_SECRET });

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

    findAll() {
        return `This action returns all auth`;
    }

    findOne(id: number) {
        return `This action returns a #${id} auth`;
    }

    update(id: number, updateAuthDto: UpdateAuthDto) {
        return `This action updates a #${id} auth`;
    }

    remove(id: number) {
        return `This action removes a #${id} auth`;
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
}
