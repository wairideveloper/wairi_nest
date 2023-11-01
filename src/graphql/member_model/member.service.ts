import {Injectable} from '@nestjs/common';
import {Member} from '../../../entity/entities/Member';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {AES_ENCRYPT, AES_DECRYPT, FROM_UNIXTIME, getNowUnix, AES_ENCRYPT2} from "../../util/common";
import {FetchPaginationInput} from "../../members/dto/fetch-pagination.input";
import {SignupInput} from '../auth_ql_model/dto/signupInput';
import {MemberChannel} from "../../../entity/entities/MemberChannel";
import {CampaignReview} from "../../../entity/entities/CampaignReview";
import {Config} from "../../../entity/entities/Config";

@Injectable()
export class MembersService {
    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        @InjectRepository(MemberChannel)
        private memberChannelRepository: Repository<MemberChannel>,
        @InjectRepository(CampaignReview)
        private campaignReviewRepository: Repository<CampaignReview>,
        @InjectRepository(Config)
        private configRepository: Repository<Config>,
    ) {
    }

    async findAlltest(skip, take) {
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

    //회원 생성
    async create(data: any) {
        try {
            const user = await this.memberRepository

                .createQueryBuilder()
                .insert()
                .into(Member, [
                    'type',
                    'id',
                    'passwd',
                    'email',
                    // 'name',
                    // 'nickname',
                    // 'phone',
                    // 'ci',
                    // 'di',
                    // 'birth',
                    // 'gender',
                    'refererRoot',
                    'refererRootInput',
                    'agreeMsg',
                    'status',
                    'level',
                    'regdate'
                ])
                .values({
                    type: () => data.type,
                    id: () => data.id,
                    passwd: () => data.passwd,
                    email: () => data.email,
                    // name: () => data.name,
                    // nickname: () => `"${data.nickname}"`,
                    // phone: () => data.phone,
                    // ci: () => `"${data.ci}"`,
                    // di: () => `"${data.di}"`,
                    // birth: () => data.birth,
                    // gender: () => `"${data.gender}"`,
                    refererRoot: () => data.refererRoot,
                    refererRootInput: () => `"${data.refererRootInput}"`,
                    agreeMsg: () => data.agree,
                    status: () => data.status,
                    level: () => data.level,
                    regdate: () => data.regdate
                })
                // .getSql();
                // console.log("-> user", user);
                .execute();
            return user;
        } catch (error) {
            throw error;
        }
    }

    async findAll(skip, take) {
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
            .select('*')
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
            .select('idx,id,type,level,nickname,status,regdate,lastSignin')
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
        return await this.campaignReviewRepository
            .createQueryBuilder()
            .select('*')
            .addSelect(`(${FROM_UNIXTIME('regdate')})`, 'regdate')
            .where('memberIdx = :memberIdx', {memberIdx: memberIdx})
            .getRawMany();
    }

    async findByNickName(nickname: string) {
        return await this.memberRepository
            .createQueryBuilder()
            .select('*')
            .where('nickname = :nickname', {nickname: nickname})
            .getRawOne();
    }

    async updatePassword(idx, password: string) {
        return await this.memberRepository
            .createQueryBuilder()
            .update()
            .set({passwd: password})
            .where('idx = :idx', {idx: idx})
            .execute();
    }

    async findSnsChannel() {
        return await this.configRepository.find({where: [{cfgKey: 'sns_channel'}]})
    }

    async findSubscriptionPath() {
        return await this.configRepository.find({where: [{cfgKey: 'subscription_path'}]})
    }

    async setMemberChannel(data: {
        memberIdx: number;
        link: string;
        type: number;
        interests: any;
        channelName?: string;
    }) {
        return await this.memberChannelRepository
            .createQueryBuilder()
            .insert()
            .into(MemberChannel)
            .values({
                memberIdx: data.memberIdx,
                link: data.link,
                type: data.type,
                interests: data.interests,
                typeText: data.channelName,
                regdate: getNowUnix(),
                level: 0
            })
            .execute();
    }

    async checkChannelType(channelType: number, memberIdx: number) {
        return await this.memberChannelRepository
            .createQueryBuilder()
            .select('*')
            .where('type = :type', {type: channelType})
            .andWhere('memberIdx = :memberIdx', {memberIdx: memberIdx})
            .getRawOne();
    }

    async createChannel(channelData) {
        return await this.memberChannelRepository
            .createQueryBuilder()
            .insert()
            .into(MemberChannel, [
                'memberIdx',
                'type',
                'typeText',
                'link',
                'regdate',
                'level'
            ])
            .values({
                memberIdx: channelData.memberIdx,
                type: channelData.type,
                typeText: "",
                link: channelData.link,
                regdate: channelData.regdate,
                level: channelData.level
            })
            .execute();
    }

    async deleteMemberChannel(data: { memberIdx: number; channelIdx: number }) {
        return await this.memberChannelRepository
            .createQueryBuilder()
            .delete()
            .where('memberIdx = :memberIdx', {memberIdx: data.memberIdx})
            .andWhere('idx = :idx', {idx: data.channelIdx})
            .execute();
    }

    async createMemberChannel(channelData: {
        type: any;
        url?: string;
        average_visitor?: number;
        subscriber?: number;
        content_count?: number;
        followers?: number;
        follow?: number;
        memberIdx?: any;
        link?: any;
        regdate?: any;
        level?: any;
    }) {

        console.log("-> channelData", channelData);
    }

    async checkUnique(unique: any) {
        return await this.memberRepository
            .createQueryBuilder()
            .select('*')
            .where('ci = :unique', {unique: unique})
            .getRawOne();
    }

    async checkUniqueFindId(unique: any, phone, name) {
        return await this.memberRepository
            .createQueryBuilder()
            .select('*')
            .where('ci = :unique', {unique: unique})
            .andWhere(`${AES_DECRYPT('name')} = :name`, {name: name})
            .andWhere(`${AES_DECRYPT('phone')} = :phone`, {phone: phone})
            .getRawOne();
    }

    async getMemberChannel(channelIdx: number) {
        return await this.memberChannelRepository
            .createQueryBuilder()
            .select('*')
            .where('idx = :idx', {idx: channelIdx})
            .getRawOne();
    }

    async updateMemberChannel(data: {
        idx: number;
        memberIdx: number;
        link: string;
        channelName: string;
        type: number;
        interests: any
    }) {
        console.log("=>(member.service.ts:320) channelName", data.channelName);
        return await this.memberChannelRepository
            .createQueryBuilder()
            .update()
            .set({
                link: data.link,
                type: data.type,
                interests: data.interests,
                typeText: data.channelName,
                regdate: getNowUnix(),
                level: 0
            })
            .where('idx = :idx', {idx: data.idx})
            .andWhere('memberIdx = :memberIdx', {memberIdx: data.memberIdx})
            .execute();
    }

    async getMemberChannelAll(idx: number) {
        return await this.memberChannelRepository
            .createQueryBuilder()
            .select('*')
            .where('memberIdx = :memberIdx', {memberIdx: idx})
            .orderBy('type', 'ASC')
            .getRawMany();
    }

    async updateUnique(idx, ci: string, di: string, phone: string){
        return await this.memberRepository
            .createQueryBuilder()
            .update()
            .set({
                ci: ci,
                di: di,
                // string casting
                phone: AES_ENCRYPT(phone)
            })
            .where('idx = :idx', {idx: idx})
            .execute();

    }

    async reVerifyPhoneV2(memberIdx: any, unique: string) {
        return await this.memberRepository
            .createQueryBuilder()
            .update()
            .set({ci: unique})
            .where('idx = :idx', {idx: memberIdx})
            .execute();
    }

    async updateMemberInfo(idx, nickname: string, email: string) {
        let query = this.memberRepository
            .createQueryBuilder()
            .update();

        //nickname 이 있으면 nickname 을 업데이트
        //email 이 있으면 email 을 업데이트
        // 둘다 있으면 둘다 업데이트
        if (nickname && email) {
            console.log("=>(member.service.ts:375");
            query.set({nickname: nickname})
                .set({email: email})
        } else if (nickname) {
            console.log("=>(member.service.ts:379");
            query.set({nickname: nickname})
        } else if (email) {
            console.log("=>(member.service.ts:382");
            query.set({email: email})
        }

        return await query
            .where('idx = :idx', {idx: idx})
            .execute();
    }
}
