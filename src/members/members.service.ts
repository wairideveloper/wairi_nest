import {Injectable} from '@nestjs/common';
import {CreateMemberDto} from './dto/create-member.dto';
import {UpdateMemberDto} from './dto/update-member.dto';
import {Member} from '../../entity/entities/Member';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {AES_ENCRYPT, AES_DECRYPT, FROM_UNIXTIME} from "../util/common";
import {FetchPaginationInput} from "../members/dto/fetch-pagination.input";
@Injectable()
export class MembersService {
    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
    ) {
    }

    create(createMemberDto: CreateMemberDto) {
        return 'This action adds a new member';
    }

    async findAll(skip,take) {
        return await this.memberRepository
            .createQueryBuilder()
            .select('*')
            .addSelect(`(${AES_DECRYPT('name')})`, 'name')
            .addSelect(`(${AES_DECRYPT('email')})`, 'email')
            .addSelect(`(${AES_DECRYPT('phone')})`, 'phone')
            .orderBy('idx', 'DESC')
            .offset(skip)
            .limit(take)
            .getRawMany();
    }

    async findOne(id: number) {
        return await this.memberRepository
            .createQueryBuilder()
            .select('*')
            .addSelect(`(${AES_DECRYPT('name')})`, 'name')
            .addSelect(`(${AES_DECRYPT('email')})`, 'email')
            .addSelect(`(${AES_DECRYPT('phone')})`, 'phone')
            .where('idx = :idx', {idx: id})
            .getRawOne();
    }

    async findByEmail(email: string) {
        return await this.memberRepository
            .createQueryBuilder()
            // .select('*')
            .select(['idx',
                'id',
                'level',
                ])
            .addSelect(`(${AES_DECRYPT('name')})`, 'name')
            .addSelect(`(${AES_DECRYPT('email')})`, 'email')
            .addSelect(`(${AES_DECRYPT('phone')})`, 'phone')
            .addSelect(`(${FROM_UNIXTIME('birth')})`, 'birth')
            .addSelect(`(${FROM_UNIXTIME('regdate')})`, 'regdate')
            .addSelect(`(${FROM_UNIXTIME('lastUpdate')})`, 'lastUpdate')
            .addSelect(`(${FROM_UNIXTIME('lastSignin')})`, 'lastSignin')
            .addSelect('passwd')
            .where(`${AES_DECRYPT('email')} = :email`, {email: email})
            .getRawOne();
    }

    update(id: number, updateMemberDto: UpdateMemberDto) {
        return `This action updates a #${id} member`;
    }

    remove(id: number) {
        return `This action removes a #${id} member`;
    }
}
