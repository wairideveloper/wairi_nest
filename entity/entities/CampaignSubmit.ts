import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Campaign} from "./Campaign";
import {CampaignItem} from "./CampaignItem";

@Entity("campaignSubmit", {schema: "wairi"})
export class CampaignSubmit {
    @PrimaryGeneratedColumn({type: "int", name: "idx"})
    idx: number;

    @Column("varchar", {name: "sid", length: 50})
    sid: string;

    @Column("int", {name: "status"})
    status: number;

    @Column("int", {name: "memberIdx"})
    memberIdx: number;

    @Column("int", {name: "memberType"})
    memberType: number;

    @Column("int", {name: "memberType2"})
    memberType2: number;

    @Column("blob", {name: "nmName"})
    nmName: Buffer;

    @Column("blob", {name: "nmPhone"})
    nmPhone: Buffer;

    @Column("int", {name: "campaignIdx"})
    campaignIdx: number;

    @Column("int", {name: "itemIdx"})
    itemIdx: number;

    @Column("int", {name: "infIdx"})
    infIdx: number;

    @Column("int", {name: "startDate"})
    startDate: number;

    @Column("int", {name: "endDate"})
    endDate: number;

    @Column("int", {name: "nights"})
    nights: number;

    @Column("int", {name: "payItem"})
    payItem: number;

    @Column("int", {name: "payTotal"})
    payTotal: number;

    @Column("int", {name: "payRefunds"})
    payRefunds: number;

    @Column("int", {name: "totalDeposit"})
    totalDeposit: number;

    @Column("int", {name: "regdate"})
    regdate: number;

    @Column("int", {name: "agreeMsg"})
    agreeMsg: number;

    @Column("int", {name: "paymentIdx"})
    paymentIdx: number;

    @Column("text", {name: "postUrl"})
    postUrl: string;

    @Column("text", {name: "postTitle"})
    postTitle: string;

    @Column("text", {name: "postRemarks"})
    postRemarks: string;

    @Column("int", {name: "submitChannel"})
    submitChannel: number;

    @Column("int", {name: "statusDate500"})
    statusDate500: number;

    @Column("int", {name: "statusDate550"})
    statusDate550: number;

    @Column("int", {name: "statusDate900"})
    statusDate900: number;

    @Column("int", {name: "statusDateDeny"})
    statusDateDeny: number;

    @Column("int", {name: "statusDateRefund"})
    statusDateRefund: number;

    @Column("text", {name: "denyReason"})
    denyReason: string;

    @Column("text", {name: "cancelReason"})
    cancelReason: string;

    @Column("text", {name: "refundReason"})
    refundReason: string;

    @Column("int", {name: "cancelUser", comment: "1:사용자,2:광고주,3:관리자"})
    cancelUser: number;

    @Column("int", {name: "autoCancelDate"})
    autoCancelDate: number;

    @Column("int", {name: "isPostSummary"})
    isPostSummary: number;

    @Column("int", {name: "nop"})
    nop: number;

    @Column("text", {name: "subContent1"})
    subContent1: string;

    @Column("text", {name: "subContent2"})
    subContent2: string;

    @Column("int", {
        name: "isSentUseNoti",
        comment: "이용수칙 알림안내 발송여부",
    })
    isSentUseNoti: number;

    @Column("int", {name: "sendUseNotiDate"})
    sendUseNotiDate: number;

    @Column("text", {name: "sendUseNotiResultMsg"})
    sendUseNotiResultMsg: string;

    @Column("int", {name: "payExpire"})
    payExpire: number;

    @Column("int", {name: "infReward"})
    infReward: number;

    @Column("float", {name: "infRewardPer", precision: 12})
    infRewardPer: number;

    @Column("varchar", {name: "campaignName", length: 100})
    campaignName: string;

    @Column("varchar", {name: "itemName", length: 100})
    itemName: string;

    @Column("int", {name: "recInfIdx"})
    recInfIdx: number;

    @Column("varchar", {name: "recInfName", length: 50})
    recInfName: string;

    @Column("int", {name: "recInfDiscount"})
    recInfDiscount: number;

    @Column("int", {
        name: "bInfContentUploadRemind",
        comment: "ext/bInfContentUploadRemind 실행여부",
    })

    @Column("int", {name: "agreeContent"})
    agreeContent: number;

    bInfContentUploadRemind: number;

    @Column("longtext", {name: "options", nullable: true})
    options: string | null;

    @Column("char", {name: "use_app"})
    use_app: number;

    @ManyToOne(() => Campaign, (campaign) => campaign.idx)
    campaign: Campaign;

    @ManyToOne(()=>CampaignItem, (campaignItem)=>campaignItem.idx)
    @JoinColumn({name: "itemIdx"})
    campaignItem: CampaignItem;
}
