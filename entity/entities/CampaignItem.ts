import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Campaign} from "./Campaign";
import {CampaignReview} from "./CampaignReview";
import {CampaignItemSchedule} from "./CampaignItemSchedule";

@Entity("campaignItem", {schema: "wairi"})
export class CampaignItem {
    @PrimaryGeneratedColumn({type: "int", name: "idx"})
    idx: number;

    @Column("int", {name: "campaignIdx"})
    campaignIdx: number;

    @Column("varchar", {name: "name", length: 50})
    name: string;

    @Column("int", {name: "startDate"})
    startDate: number;

    @Column("int", {name: "endDate"})
    endDate: number;

    @Column("int", {name: "notWeekends"})
    notWeekends: number;

    @Column("int", {name: "limitSleep", comment: "투숙가능인원"})
    limitSleep: number;

    @Column("int", {name: "limitSubmit", comment: "신청가능인원"})
    limitSubmit: number;

    @Column("int", {name: "price"})
    price: number;

    @Column("int", {name: "priceOrig"})
    priceOrig: number;

    @Column("int", {name: "priceNormal"})
    priceNormal: number;

    @Column("int", {name: "priceBenefit"})
    priceBenefit: number;

    @Column("int", {name: "priceInf"})
    priceInf: number;

    @Column("int", {name: "priceDeposit"})
    priceDeposit: number;

    @Column("float", {name: "priceDepositPer", precision: 12})
    priceDepositPer: number;

    @Column("varchar", {name: "image", length: 50})
    image: string;

    @Column("int", {name: "ordering"})
    ordering: number;

    @Column("longtext", {name: "info"})
    info: string;

    @Column("longtext", {name: "infoGuide"})
    infoGuide: string;

    @Column("longtext", {name: "infoRefund"})
    infoRefund: string;

    @Column("longtext", {name: "infoRefund1"})
    infoRefund1: string;

    @Column("longtext", {name: "infoRefund2"})
    infoRefund2: string;

    @Column("varchar", {name: "channels", length: 200})
    channels: string;

    @Column("int", {name: "onlyMemberType2"})
    onlyMemberType2: number;

    @Column("int", {name: "remove"})
    remove: number;

    @Column("int", {name: "memberTarget"})
    memberTarget: number;

    @Column("int", {name: "maxDays", default: () => "'2'"})
    maxDays: number;

    @Column("int", {name: "minDays", default: () => "'2'"})
    minDays: number;

    @Column("int", {name: "minSubmit", default: () => "'1'"})
    minSubmit: number;

    @Column("int", {name: "calcType1"})
    calcType1: number;

    @Column("int", {name: "calcType2"})
    calcType2: number;

    @Column("int", {name: "reward"})
    reward: number;

    @Column("float", {name: "rewardPer", precision: 12})
    rewardPer: number;

    @Column("int", {
        name: "sellType",
        comment: "1:캠페인,2:쿠폰",
        default: () => "'1'",
    })
    sellType: number;

    @Column("float", {name: "recInfPer", precision: 12})
    recInfPer: number;

    @Column("float", {
        name: "dc11",
        comment: "결제비율-\bA급인플루언서",
        precision: 12,
        default: () => "'10'",
    })
    dc11: number;

    @Column("float", {
        name: "dc12",
        comment: "결제비율-\bB급인플루언서 ",
        precision: 12,
        default: () => "'103'",
    })
    dc12: number;

    @Column("float", {
        name: "dc21",
        comment: "결제비율-\b일반",
        precision: 12,
        default: () => "'115'",
    })
    dc21: number;

    @Column("float", {
        name: "dc22",
        comment: "결제비율-\b추천인",
        precision: 12,
        default: () => "'110'",
    })
    dc22: number;

    @Column("int", {name: "regdate"})
    regdate: number;

    @Column("int", {name: "itemDiscount"})
    itemDiscount: number;

    @Column("varchar", {name: "itemDiscountText", length: 100})
    itemDiscountText: string;

    @ManyToOne((type) => Campaign, (Campaign) => Campaign.campaignItem)
    campaign: Campaign

    // @Column("int", {name: "minPriceOrig"})
    // minPriceOrig: number;

    @OneToOne((type) => CampaignReview, (CampaignReview) => CampaignReview.campaignItem)
    @JoinColumn({name: "idx"})
    campaignReview: CampaignReview;

    @OneToMany(()=>CampaignItemSchedule, (CampaignItemSchedule)=>CampaignItemSchedule.campaignItem)
    campaignItemSchedule: CampaignItemSchedule[];
}
