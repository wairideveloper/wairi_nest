import {Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {CateArea} from "./CateArea";
import {Campaign} from "./Campaign";

@Index("memberIdx", ["memberIdx"], {})
@Entity("campaignFav", { schema: "wairi" })
export class CampaignFav {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "memberIdx" })
  memberIdx: number;

  @Column("int", { name: "campaignIdx" })
  campaignIdx: number;

  @Column("int", { name: "regdate" })
  regdate: number;

  //campaign entity와 1:1 관계
    @OneToOne(() => Campaign, (campaign) => campaign.campaignFav)
    @JoinColumn([{ name: "campaignIdx", referencedColumnName: "idx" }])
    campaign: Campaign;
}
