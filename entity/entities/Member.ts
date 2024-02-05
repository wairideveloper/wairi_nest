import {Column, Entity, PrimaryGeneratedColumn, BeforeInsert, ManyToMany, OneToMany, JoinColumn} from 'typeorm';
import {EncryptionTransformer} from 'typeorm-encrypted';
import {CampaignReview} from "./CampaignReview";
import {MemberChannel} from "./MemberChannel";

@Entity('member', {schema: 'wairi'})
export class Member {
    @PrimaryGeneratedColumn({type: 'int', name: 'idx'})
    idx: number;

    //default value 설정
    @Column('int', {
        name: 'type',
        default: 1,
        comment: '1:인플루언서 / 2:일반고객 / 3:광고주',
    })
    type: number;

    @Column('int', {name: 'level', default: '1'})
    level: number;

    @Column('int', {name: 'status', default: '1'})
    status: number;

    @Column('varchar', {name: 'id', default: '', length: 20})
    id: string;

    @Column('blob', {
        name: 'email',
        default: '',
    })
    email: string;

    @Column('blob', {
        name: 'phone',
        default: '',
    })
    phone: any;

    @Column('blob', {
        name: 'name',
        // default: '',
    })
    name: Buffer;

    @Column('varchar', {name: 'nickname', length: 50})
    nickname: string;

    @Column('varchar', {name: 'passwd', length: 255})
    passwd: string;

    @Column('varchar', {name: 'regdate', default: new Date().getTime() / 1000, length: 20})
    regdate: string;

    @Column('int', {name: 'lastUpdate', default: new Date().getTime() / 1000})
    lastUpdate: number;

    @Column('varchar', {name: 'exitdate',length: 20, default: ''})
    exitdate: string;

    @Column('int', {name: 'exit_admin_idx', nullable: true})
    exit_admin_idx: number;

    @Column('varchar', {name: 'last_visit', length: 20, default: new Date().getTime() / 1000})
    last_visit: string;

    @Column('varchar', {name: 'social_type', length: 20, default: ''})
    social_type: string;

    @Column('varchar', {name: 'social_naver', length: 100, default: ''})
    social_naver: string;

    @Column('varchar', {name: 'social_kakao', length: 100, default: ''})
    social_kakao: string;

    @Column('varchar', {name: 'social_google', length: 100, default: ''})
    social_google: string;

    @Column('varchar', {name: 'social_facebook', length: 100, default: ''})
    social_facebook: string;

    @Column('varchar', {name: 'social_apple', length: 100, default: ''})
    social_apple: string;

    @Column('int', {name: 'is_website', default: 0})
    is_website: number;

    @Column('int', {name: 'channelType', default: 0})
    channelType: number;

    @Column('varchar', {name: 'channelTypeText', length: 50, default: ''})
    channelTypeText: string;

    @Column('text', {name: 'channelLink', default: ''})
    channelLink: string;

    @Column('varchar', {name: 'ci', length: 200, default: ''})
    ci: string;

    @Column('varchar', {name: 'di', length: 200, default: ''})
    di: string;

    @Column('varchar', {name: 'gender', length: 1, default: ''})
    gender: string;

    @Column('int', {name: 'birth', default: 0})
    birth: number;

    @Column('int', {name: 'lastSignin', default: 0})
    lastSignin: number;

    @Column('int', {name: 'refererRoot', default: 0})
    refererRoot: number;

    @Column('text', {name: 'refererRootInput', default: ''})
    refererRootInput: string;

    @Column('int', {name: 'isTest', default: 0})
    isTest: number;

    @Column('int', {name: 'agreeMsg', default: 0})
    agreeMsg: number;

    @Column('text', {name: 'withdrawal'})
    withdrawal: string;

    @Column('varchar', {name: 'code'})
    code: string;

    @Column('int', {name: 'is_black', default: 0})
    is_black: number;

    @OneToMany(() => CampaignReview, (campaignReview) => campaignReview.memberIdx)
    review: CampaignReview[];

    @OneToMany(() => MemberChannel, (memberChannel) => memberChannel.member)
    @JoinColumn({ name: 'idx', referencedColumnName: 'memberIdx' })
    memberChannel: MemberChannel[];



    // @BeforeInsert()
    // beforeInsertActions() {
    //     this.idx = 0;
    //     this.id = '';
    //     // this.email = Buffer.from('');
    //     // this.phone = Buffer.from('');
    //     // this.name = Buffer.from('');
    //     // this.passwd = '';
    //     this.type = 2;
    //     this.level = 0;
    //     this.status = 1;
    //     this.nickname = '';
    //     this.regdate = new Date().getTime() / 1000 + '';
    //     this.lastUpdate = new Date().getTime() / 1000;
    //     this.exitdate = '';
    //     // this.exit_admin_idx = 0;
    //     this.last_visit = new Date().getTime() / 1000 + '';
    //     this.social_type = '';
    //     this.social_naver = '';
    //     this.social_kakao = '';
    //     this.social_google = '';
    //     this.social_facebook = '';
    //     this.is_website = 0;
    //     this.channelType = 0;
    //     this.channelTypeText = '';
    //     this.channelLink = '';
    //     this.ci = '';
    //     this.di = '';
    //     this.birth = 0;
    //     this.gender = '';
    //     this.lastSignin = 0;
    //     this.refererRoot = 0;
    //     this.refererRootInput = '';
    //     this.isTest = 0;
    //     this.agreeMsg = 0;
    // }
    username: any;
}
