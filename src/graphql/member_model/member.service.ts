import {Injectable} from '@nestjs/common';
import {Member} from '../../../entity/entities/Member';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {AES_ENCRYPT, AES_DECRYPT, FROM_UNIXTIME, getNowUnix} from "../../util/common";
import {FetchPaginationInput} from "../../members/dto/fetch-pagination.input";
import { SignupInput } from '../auth_ql_model/dto/signupInput';
import {MemberChannel} from "../../../entity/entities/MemberChannel";
import {CampaignReview} from "../../../entity/entities/CampaignReview";

@Injectable()
export class MembersService {
    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        @InjectRepository(MemberChannel)
        private memberChannelRepository: Repository<MemberChannel>,
        @InjectRepository(CampaignReview)
        private campaignReviewRepository: Repository<CampaignReview>,
    ) {
    }

    //회원 생성
    async create(data: any) {
        console.log("-> data", data);

        try{
            const user = this.memberRepository
                .createQueryBuilder()
                .insert()
                .into(Member, ['id', 'email', 'name', 'passwd','phone','type','status','level','regdate'])
                .values({
                    id: () => data.id,
                    email: () => data.email,
                    name: () => data.name,
                    phone: () => data.phone,
                    passwd: () => data.passwd,
                    type : 1,
                    status: 9,
                    level: 1,
                    regdate: () => data.regdate
                })
                // .getSql();
            // console.log("-> user", user);
                .execute();
            return user;

            // const member = await this.memberRepository.create(data);
            // console.log("-> member", member);
        }catch (error) {
            throw error;
        }
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

    update(id: number) {
        return `This action updates a #${id} member`;
    }

    remove(id: number) {
        return `This action removes a #${id} member`;
    }

    async findByPhone(phone: string, username: string) {
        return await this.memberRepository
            .createQueryBuilder()
            .select('idx')
            .addSelect(`(${AES_DECRYPT('name')})`, 'name')
            .addSelect(`(${AES_DECRYPT('email')})`, 'email')
            .addSelect(`(${AES_DECRYPT('phone')})`, 'phone')
            .addSelect(`(${FROM_UNIXTIME('regdate')})`, 'regdate')
            .where(`${AES_DECRYPT('phone')} = :phone`, {phone: phone})
            .andWhere(`${AES_DECRYPT('name')} = :username`, {username: username})
            .getRawOne();
    }

    async findChannel(memberIdx: number) {
        return await this.memberChannelRepository.find({where: [{memberIdx: memberIdx}]});
    }

    async findReview(memberIdx: number) {
        return await this.campaignReviewRepository.find({
            select: ["regdate"],
            where: [{memberIdx: memberIdx}]});
    }
}
