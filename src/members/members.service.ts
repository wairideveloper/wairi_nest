import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateMemberDto} from './dto/create-member.dto';
import {UpdateMemberDto} from './dto/update-member.dto';
import {Member} from '../../entity/entities/Member';
import {MemberChannel} from "../../entity/entities/MemberChannel";
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {AES_ENCRYPT, AES_DECRYPT, FROM_UNIXTIME} from "../util/common";
import {FetchPaginationInput} from "../members/dto/fetch-pagination.input";


/*
type
1. 블로그
2. youtube
3. 인스타그램
9. 기타

level
0. 승인대기
1. 인플루언서
2. 성장형 인플루언서
9. 재승인요청
-1. 승인거절
 */
@Injectable()
export class MembersService {
    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        @InjectRepository(MemberChannel)
        private memberChannelRepository: Repository<MemberChannel>,
    ) {
    }

    create(createMemberDto: CreateMemberDto) {

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
            .orderBy('idx', 'DESC')
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
                'type',
                'social_naver',
                'social_kakao',
                'social_google',
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

    async findById(id: string) {
        return await this.memberRepository
            .createQueryBuilder()
            // .select('*')
            .select(['idx',
                'id',
                'level',
                'type',
            ])
            .addSelect(`(${AES_DECRYPT('name')})`, 'name')
            .addSelect(`(${AES_DECRYPT('email')})`, 'email')
            .addSelect(`(${AES_DECRYPT('phone')})`, 'phone')
            .addSelect(`(${FROM_UNIXTIME('birth')})`, 'birth')
            .addSelect(`(${FROM_UNIXTIME('regdate')})`, 'regdate')
            .addSelect(`(${FROM_UNIXTIME('lastUpdate')})`, 'lastUpdate')
            .addSelect(`(${FROM_UNIXTIME('lastSignin')})`, 'lastSignin')
            .addSelect('passwd')
            .where('id = :id', {id: id})
            .getRawOne();
    }

    update(id: number, updateMemberDto: UpdateMemberDto) {
        return `This action updates a #${id} member`;
    }

    remove(id: number) {
        return `This action removes a #${id} member`;
    }

    async setMemberChannel(data: {memberIdx: number; link: string; type: number}) {
        return await this.memberChannelRepository
            .createQueryBuilder()
            .insert()
            .into(MemberChannel)
            .values({
                memberIdx: data.memberIdx,
                link: data.link,
                type: data.type,
            })
            .execute();
    }


    async findSocialId(email, id, socialType) {
        return await this.memberRepository
            .createQueryBuilder()
            .select('*')
            .where(`${AES_DECRYPT('email')} = :email`, {email: email})
            .andWhere(`${socialType} = :id`, {id: id})
            .getRawOne();

    }

    async findIdByIdx(idx: number): Promise<string> {

    console.log(`Attempting to find member with idx: ${idx}`);
    try {
        const member = await this.memberRepository.findOneBy({ idx });
        console.log(`Query result:`, member);
        
        if (!member) {
            console.log(`Member not found for idx: ${idx}`);
            throw new NotFoundException(`Member with idx ${idx} not found`);
        }
        
        console.log(`Returning id for member:`, member.id);
        return member.id;
    } catch (error) {
        console.error(`Error in findIdByIdx:`, error);
        throw error;
    }

        // const member = await this.memberRepository.findOne({where: { idx }});
        // if (!member) {
        //     throw new NotFoundException(`Member with idx ${idx} not found`);
        // }
        // return member.id;
    }
}
