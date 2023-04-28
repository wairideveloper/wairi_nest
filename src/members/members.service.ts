import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from '../../entity/entities/Member';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}
  create(createMemberDto: CreateMemberDto) {
    return 'This action adds a new member';
  }

  async findAll() {
    return await this.memberRepository
      .createQueryBuilder()
      .select('*')
      .addSelect('(CAST(AES_DECRYPT(UNHEX(email),"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")as char))', 'email')
      .addSelect('(CAST(AES_DECRYPT(UNHEX(name),"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")as char))', 'name')
      .addSelect('(CAST(AES_DECRYPT(UNHEX(phone),"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")as char))', 'phone')
      .orderBy('idx', 'DESC')
      .getRawMany();
  }

  findOne(id: number) {
    return this.memberRepository
      .createQueryBuilder()
      .select('*')
      .addSelect('(CAST(AES_DECRYPT(UNHEX(email),"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")as char))', 'email')
      .addSelect('(CAST(AES_DECRYPT(UNHEX(name),"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")as char))', 'name')
      .addSelect('(CAST(AES_DECRYPT(UNHEX(phone),"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")as char))', 'phone')
      .where('idx', { id })
      .getRawOne();
  }

  async findByEmail(email: string) {
    return await this.memberRepository
      .createQueryBuilder()
      .select('idx')
      .addSelect(`(${this.AES_DECRYPT('name')})`, 'name')
      .addSelect(`(${this.AES_DECRYPT('email')})`, 'email')
      .addSelect('passwd')
      .where(`${this.AES_DECRYPT('email')} = :email`, { email: email })
      .getRawOne();
  }

  update(id: number, updateMemberDto: UpdateMemberDto) {
    return `This action updates a #${id} member`;
  }

  remove(id: number) {
    return `This action removes a #${id} member`;
  }

  //AES_ENCRYPT 암호화
  AES_ENCRYPT(column: string) {
    return `HEX(AES_ENCRYPT(${column},"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6"))`;
  }

  //AES_DECRYPT 복호화
  AES_DECRYPT(column: string) {
    return `CAST(AES_DECRYPT(UNHEX(${column}),"@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")as char)`;
  }
}
