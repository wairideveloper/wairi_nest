import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Member} from "./Member";
import {Campaign} from "./Campaign";
import {CampaignItem} from "./CampaignItem";
import {CampaignReviewImage} from "./CampaignReviewImage";

@Entity("campaignReview", {schema: "wairi"})
export class CampaignReview {
    @PrimaryGeneratedColumn({type: "int", name: "idx"})
    idx: number;

    @Column("int", {name: "memberIdx"})
    memberIdx: number;

    @Column("int", {name: "campaignIdx"})
    campaignIdx: number;

    @Column("int", {name: "itemIdx"})
    itemIdx: number;

    @Column("int", {name: "submitIdx"})
    submitIdx: number;

    @Column("int", {name: "rate"})
    rate: number;

    @Column("text", {name: "content"})
    content: string;

    @Column("text", {name: "images"})
    images: string;

    @Column("int", {name: "regdate"})
    regdate: any;

    @Column("text", {name: "content_a"})
    contentA: string;

    @Column("int", {name: "regdate_a"})
    regdateA: number;

    @Column("text", {name: "aws_use_yn"})
    aws_use_yn: string;

    @ManyToOne(() => Member, (member) => member.idx)
    member: Member;

    @ManyToOne(() => Campaign, (campaign) => campaign.idx)
    campaign: Campaign;

    @OneToMany(() => CampaignReviewImage, (campaignReviewImage) => campaignReviewImage.reviewIdx)
    campaignReviewImages: CampaignReviewImage[];

    @OneToOne(() => CampaignItem, (campaignItem) => campaignItem.idx)
    @JoinColumn({name: "itemIdx"})
    campaignItem: CampaignItem;
}
