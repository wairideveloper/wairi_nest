import {Injectable} from '@nestjs/common';
import {Member} from '../../../entity/entities/Member';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {
    AES_ENCRYPT,
    AES_DECRYPT,
    FROM_UNIXTIME,
    getNowUnix,
    AES_ENCRYPT2,
    hashPassword,
    bufferToString
} from "../../util/common";
import {FetchPaginationInput} from "../../members/dto/fetch-pagination.input";
import {SignupInput} from '../auth_ql_model/dto/signupInput';
import {MemberChannel} from "../../../entity/entities/MemberChannel";
import {CampaignReview} from "../../../entity/entities/CampaignReview";
import {Config} from "../../../entity/entities/Config";
import {Partner} from "../../../entity/entities/Partner";
import * as moment from "moment/moment";

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
        @InjectRepository(Partner)
        private partnerRepository: Repository<Partner>,
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
                    'regdate',
                    'lastSignin',
                    'code'
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
                    regdate: () => data.regdate,
                    lastSignin: () => data.lastSignin,
                    code: () => `"${data.code}"`
                })
                // .getSql();
                // console.log("-> user", user);
                .execute();
            return user;
        } catch (error) {
            throw error;
        }
    }

    async createSocial(
        social_type: string,
        nickname: string,
        id: string,
        email: string,
        name: string,
        refererRoot: number,
        refererRootInput: string,
        agreeMsg: number,
        code: string
    ) {
        try {
            const now = getNowUnix();
            const passwd = await hashPassword(id.toString());
            // 회원 닉네임 난수 생성
            const nickname = `user_${Math.floor(Math.random() * 1000000)}`;
            const memberInsert = await this.memberRepository
                .createQueryBuilder()
                .insert()
                .into(Member, ['id', 'social_kakao', 'social_naver', 'social_google', 'social_apple', 'type', 'level', 'status', 'social_type', 'nickname', 'email',
                    'name', 'passwd', 'regdate', 'agreeMsg', 'refererRoot', 'refererRootInput', 'code'
                ])
                .values({
                    id: () => `"${id}"`,
                    social_kakao: () => social_type == "1" ?`"${id}"` : null,
                    social_naver: () => social_type == "2" ?`"${id}"` : null,
                    social_google: () => social_type == "3" ?`"${id}"` : null,
                    social_apple: () => social_type == "4" ?`"${id}"` : null,
                    type: 1,
                    level: 0,
                    status: 1,
                    social_type: social_type,
                    nickname: () => name ? `"${name}"` : `"${nickname}"`,
                    email: () => AES_ENCRYPT(email),
                    // phone: () => phone ? AES_ENCRYPT(phone) : AES_ENCRYPT(""),
                    name: () => name ? AES_ENCRYPT(name) : AES_ENCRYPT(nickname),
                    passwd: () => `"${passwd}"`,
                    regdate: () => `"${now}"`,
                    agreeMsg: agreeMsg,
                    refererRoot: refererRoot,
                    refererRootInput: refererRootInput,
                    code: `${code}` // 개인 추천코드 생성
                })
                .execute();

            return memberInsert;
        }catch (e) {
            console.log(e)
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
        const result = await this.memberRepository
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
            .addSelect('code')
            .where('id = :id', {id: id})
            // .andWhere('status != -9')
            // status -9 는 탈퇴회원
            // .andWhere('status != -9')
            .getRawOne();

        return result;
    }

    async findByIdSecession(id) {
        const result = await this.memberRepository
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
            .andWhere('status != -9')
            // status -9 는 탈퇴회원
            // .andWhere('status != -9')
            .getRawOne();

        return result;
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
            .andWhere('type = 1')
            .andWhere('status in (1,4,9)')
            .andWhere('social_type is null')
            .getRawOne();
    }

    async findByPhoneAndId(phone, username, id) {
        return await this.memberRepository
            .createQueryBuilder()
            .select('idx,id,type,level,nickname,status,regdate,lastSignin')
            .addSelect(`(${AES_DECRYPT('name')})`, 'name')
            .addSelect(`(${AES_DECRYPT('email')})`, 'email')
            .addSelect(`(${AES_DECRYPT('phone')})`, 'phone')
            .addSelect(`(${FROM_UNIXTIME('regdate')})`, 'regdate')
            .where(`${AES_DECRYPT('phone')} = :phone`, {phone: phone})
            .andWhere(`${AES_DECRYPT('name')} = :username`, {username: username})
            .andWhere('idx = :idx', {idx: id})
            //status 1, 4, 9일때만
            .andWhere('type = 1')
            .andWhere('status in (1,4,9)')
            .getRawOne();
    }

    async findChannel(memberIdx: number) {
        return await this.memberChannelRepository.find({where: [{memberIdx: memberIdx}]});
    }

    async findReview(memberIdx: number) {
        let result = await this.campaignReviewRepository
            .createQueryBuilder()
            .select('*')
            .addSelect(`(${FROM_UNIXTIME('regdate')})`, 'regdate')
            .where('memberIdx = :memberIdx', {memberIdx: memberIdx})
            .getRawMany();

        return bufferToString(result);
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
        let data = await this.memberRepository
            .createQueryBuilder()
            .select('*')
            .addSelect(`(${AES_DECRYPT('name')})`, 'name')
            .addSelect(`(${AES_DECRYPT('email')})`, 'email')
            .addSelect(`(${AES_DECRYPT('phone')})`, 'phone')
            .where('ci = :unique', {unique: unique})
            .andWhere(`${AES_DECRYPT('name')} = :name`, {name: name})
            .andWhere(`${AES_DECRYPT('phone')} = :phone`, {phone: phone})
            //status 1, 4, 9일때만
            .andWhere('type = 1')
            .andWhere('status in (1,4,9)')
            .getRawOne();

        return data
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

    async updateUnique(idx, ci: string, di: string, phone: string , name: string) {
        const data = {
            ci: ci,
            di: di,
            phone: AES_ENCRYPT(phone)
        }
        return await this.memberRepository
            .createQueryBuilder()
            .update()
            .set({
                ci: ci,
                di: di,
                phone: () => `HEX(AES_ENCRYPT("${phone}","@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6"))`,
                name: () => `HEX(AES_ENCRYPT("${name}","@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6"))`
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
        // .set({
        //     ci: ci,
        //     di: di,
        //     phone: () => `HEX(AES_ENCRYPT("${phone}","@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6")`
        // })
        console.log("=>(member.service.ts:406) nickname", nickname);
        console.log("=>(member.service.ts:407) email",email );
        if (nickname && email) {
            query.set({
                nickname: nickname,
                email: () => `HEX(AES_ENCRYPT("${email}","@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6"))`
            })
                // .set({email: email})
        } else if (nickname) {
            query.set({nickname: nickname})
        } else if (email) {
            query.set({
                email: () => `HEX(AES_ENCRYPT("${email}","@F$z927U_6Cr%N3Cch8gmJ9aaY#qNzh6"))`
            })
        }

        return await query
            .where('idx = :idx', {idx: idx})
            .execute();
    }

    async findSocialId(email, id, socialType) {
        return await this.memberRepository
            .createQueryBuilder()
            .select('*')
            .addSelect(`(${AES_DECRYPT('name')})`, 'name')
            .addSelect(`(${AES_DECRYPT('email')})`, 'email')
            .addSelect(`(${AES_DECRYPT('phone')})`, 'phone')
            .addSelect('code')
            .where(`${AES_DECRYPT('email')} = :email`, {email: email})
            .andWhere('social_type = :socialType', {socialType: socialType})
            .getRawOne();
    }

    async getPartner(partnerIdx) {
        let data = await this.partnerRepository
            .createQueryBuilder()
            .select('*')
            .where('idx = :idx', {idx: partnerIdx})
            .getRawOne();
        return bufferToString(data);
    }

    async getMemberSubmitChannel(submitChannel, memberIdx: number) {
        let data = await this.memberChannelRepository
            .createQueryBuilder()
            .select('*')
            .where('type = :submitChannel', {submitChannel: submitChannel})
            .andWhere('memberIdx = :memberIdx', {memberIdx: memberIdx})
            .getRawOne();
        return bufferToString(data);
    }

    async findByRecommend(code: string) {
        let data = await this.memberRepository
            .createQueryBuilder()
            .select('*')
            .where('code = :code', {code: code})
            .getRawOne();
        return bufferToString(data);
    }

    async updateLastSignin(memberIdx) {
        return await this.memberRepository
            .createQueryBuilder()
            .update()
            .set({lastSignin: getNowUnix()})
            .where('idx = :idx', {idx: memberIdx})
            .execute();
    }

    async getMember(idx: number) {
        let data = await this.memberRepository
            .createQueryBuilder()
            //name
            .select(`(${AES_DECRYPT('name')})`, 'name')
            .addSelect(`(${AES_DECRYPT('phone')})`, 'phone')
            .where('idx = :idx', {idx: idx})
            .getRawOne();
        return bufferToString(data);
    }
}
