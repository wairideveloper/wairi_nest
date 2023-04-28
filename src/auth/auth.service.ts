import { Injectable, Logger } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from '../../entity/entities/Member';
import { Repository } from 'typeorm';
import { MembersService } from '../members/members.service';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private readonly memberService: MembersService,
    private jwtService: JwtService,
  ) {}
  async login(email: string, passwd: string) {
    const member = await this.memberService.findByEmail(email);

    const hash = member.passwd.replace(/^\$2y(.+)$/i, '$2a$1');
    const check: boolean = compareSync(passwd, hash);

    const payload = {
      idx: member.idx,
      username: member.name,
    };

    if (check) {
      return {
        message: '로그인 성공',
        access_token: await this.jwtService.signAsync(payload, { expiresIn: '1h', secret: 'wairi_jwt_secret' }),
      };
    } else {
      return {
        message: '로그인 실패',
      };
    }
  }

  async create(createAuthDto: CreateAuthDto) {
    try {
      const { id, email, name, phone, passwd } = createAuthDto;
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
}
