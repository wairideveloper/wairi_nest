import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Member} from "./Member";
import {Campaign} from "./Campaign";
import {CampaignItem} from "./CampaignItem";
import {CampaignReview} from "./CampaignReview";


@Entity("campaignReviewImage", {schema: "wairi"})
export class CampaignReviewImage {
    @PrimaryGeneratedColumn({type: "int", name: "idx"})
    idx: number;

    @Column("int", {name: "reviewIdx"})
    reviewIdx: number;

    @Column("text", {name: "key"})
    key: any;

    @Column("text", {name: "url"})
    url: any;

    @Column("datetime", {name: "create_at"})
    create_at: any;


    @ManyToOne(() => CampaignReview, (campaignReview) => campaignReview.campaignReviewImages)
    campaignReview: CampaignReview;

}
