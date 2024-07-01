import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {CampaignItem} from "./CampaignItem";
import {CampaignImage} from "./CampaignImage";
import {Cate} from "./Cate";
import {CateArea} from "./CateArea";
import {Partner} from "./Partner";
import {CampaignReview} from "./CampaignReview";
import {CampaignRecent} from "./CampaignRecent";
import {CampaignSubmit} from "./CampaignSubmit";
import {CampaignFav} from "./CampaignFav";

@Entity("campaign", {schema: "wairi", engine: 'InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci' })
export class Campaign {
    @PrimaryGeneratedColumn({type: "int", name: "idx"})
    idx: number;

    @Column("int", {name: "status"})
    status: number;

    @Column("int", {name: "approvalMethod"})
    approvalMethod: number;

    @Column("int", {name: "grade"})
    grade: number;

    @Column("int", {name: "manuscriptFee"})
    manuscriptFee: number;

    @Column("int", {name: "partnerIdx"})
    partnerIdx: number;

    @Column("varchar", {name: "name", length: 100
    })
    name: string;

    @Column("varchar", {name: "nameEn", nullable: true, length: 100})
    nameEn: string | null;

    @Column("varchar", {name: "tel", length: 30})
    tel: string;

    @Column("varchar", {name: "phone", length: 30})
    phone: string;

    @Column("varchar", {name: "zipcode", length: 6})
    zipcode: string;

    @Column("varchar", {name: "addr1", length: 100})
    addr1: string;

    @Column("varchar", {name: "addr2", length: 100})
    addr2: string;

    @Column("varchar", {name: "addrLat", length: 50})
    addrLat: string;

    @Column("varchar", {name: "addrLng", length: 50})
    addrLng: string;

    @Column("int", {name: "regdate"})
    regdate: number;

    @Column("int", {name: "cateIdx"})
    cateIdx: number;

    @Column("int", {name: "cateAreaIdx"})
    cateAreaIdx: number;

    @Column("int", {name: "remove"})
    remove: number;

    @Column("int", {name: "weight"})
    weight: number;

    @Column("text", {name: "noteReceivers"})
    noteReceivers: string;

    @Column("int", {name: "maxLimit"})
    maxLimit: number;

    @Column("int", {name: "limitUseFlag"})
    limitUseFlag: number;

    @Column("int", {name: "recommend"})
    recommend: number;

    @Column("int", {name: "deadline"})
    deadline: number;

    @Column("int", {name: "approval"})
    approval: number;

    @Column("longtext", {name: "campaignCombo"})
    campaignCombo: string;

    @Column("longtext", {name: "options", nullable: true})
    options: string | null;

    @Column("text", {name: "info"})
    info: string | null;

    @Column("text", {name: "production_guide"})
    production_guide: string | null;

    @Column("text", {name: "caution"})
    caution: string | null;

    @Column("int", {name: "discount", comment: "일반 할인율"})
    discount: number;

    @Column("varchar", {
        name: "discountText",
        comment: "일반 할인율 노출문구",
        length: 100,
    })
    discountText: string;

    @Column("char", {
        name: "discount_use",
        nullable: true,
        comment: "일반 할인율 사용여부",
        length: 1,
    })
    discountUse: string | null;

    @Column("int", {
        name: "influ_discount",
        nullable: true,
        comment: "인플루언서 할인율",
    })
    influDiscount: number | null;

    @Column("varchar", {
        name: "influ_discountText",
        nullable: true,
        comment: "인플루언서 할인율 노출문구",
        length: 100,
    })
    influDiscountText: string | null;

    @Column("char", {
        name: "influ_discount_use",
        nullable: true,
        comment: "인플루언서 할인율 사용여부",
        length: 1,
    })
    influDiscountUse: string | null;

    @Column("int", {
        name: "growth_discount",
        nullable: true,
        comment: "성장형 인플루언서 할인율",
    })
    growthDiscount: number | null;

    @Column("varchar", {
        name: "growth_discountText",
        nullable: true,
        comment: "성장형 인플루언서 할인율",
        length: 100,
    })
    growthDiscountText: string | null;

    @Column("char", {
        name: "growth_discount_use",
        nullable: true,
        comment: "성장형 인플루언서 할인율 사용여부",
        length: 1,
    })
    growthDiscountUse: string | null;

    @Column('text', { name: 'production_guide', nullable: true })
    productionGuide: string | null;

    @Column('time', { name: 'checkIn' })
    checkIn: string | null;

    @Column('time', { name: 'checkOut' })
    checkOut: string | null;

    @Column('text', { name: 'roomType' })
    roomType: string | null;

    @Column('text', { name: 'information' })
    information: string | null;

    @Column('text', { name: 'otherInformation' })
    otherInformation: string | null;

    @Column('text', { name: 'mainKeyword' })
    mainKeyword: string | null;

    @Column('text', { name: 'mission' })
    mission: string | null;

    @Column('int', { name: 'blogCount', nullable: true })
    blogCount: number;

    @Column('int', { name: 'youtubeCount', nullable: true })
    youtubeCount: number;

    @Column('int', { name: 'instaCount', nullable: true })
    instaCount: number;

    @Column('int', { name: 'tiktokCount', nullable: true })
    tiktokCount: number;

    @Column('int', { name: 'tstoryCount', nullable: true })
    tstoryCount: number;

    @Column('int', { name: 'etcCount', nullable: true })
    etcCount: number;

    @Column("int", {name: "approvalRate"})
    approvalRate: number;

    @Column("char", {name: "extra_yn",})
    extra_yn: string;

    //relation
    @OneToMany((type) => CampaignItem, (CampaignItem) => CampaignItem.campaign)
    campaignItem: CampaignItem[]

    @OneToMany(() => CampaignImage, campaignImage => campaignImage.campaign)
    campaignImage: CampaignImage[]

    @OneToMany(() => CampaignSubmit, campaignSubmit => campaignSubmit.campaignIdx)
    campaignSubmit: CampaignImage[]

    @OneToOne(() => Cate)
    @JoinColumn({name: 'cateIdx', referencedColumnName: 'idx'})
    cate: Cate;

    @OneToOne(() => CateArea)
    @JoinColumn({name: 'cateAreaIdx', referencedColumnName: 'idx'})
    cateArea: CateArea;

    @OneToOne(() => CampaignRecent)
    @JoinColumn({name: 'idx', referencedColumnName: 'campaignIdx'})
    campaignRecent: CampaignRecent;

    @OneToOne(() => Partner)
    @JoinColumn({name: 'partnerIdx', referencedColumnName: 'idx'})
    partner: Partner;

    @OneToOne(() => CampaignReview, campaignReview => campaignReview.campaign)
    campaignReview: CampaignReview;

    // campaignFav entity와 1:1 관계
    @OneToOne(() => CampaignReview, campaignReview => campaignReview.campaign)
    @JoinColumn([{ name: "campaignIdx", referencedColumnName: "idx" }])
    campaignFav: CampaignFav;
}
