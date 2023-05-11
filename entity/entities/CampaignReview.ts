import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Member} from "./Member";
import {Campaign} from "./Campaign";
import {CampaignItem} from "./CampaignItem";

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
    regdate: string;

    @Column("text", {name: "content_a"})
    contentA: string;

    @Column("int", {name: "regdate_a"})
    regdateA: number;

    @ManyToOne(() => Member, (member) => member.idx)
    member: Member;

    @ManyToOne(() => Campaign, (campaign) => campaign.idx)
    campaign: Campaign;

    @OneToOne(() => CampaignItem, (campaignItem) => campaignItem.idx)
    @JoinColumn({name: "itemIdx"})
    campaignItem: CampaignItem;
}
