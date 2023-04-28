import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("campaignReview", { schema: "wairi" })
export class CampaignReview {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "memberIdx" })
  memberIdx: number;

  @Column("int", { name: "campaignIdx" })
  campaignIdx: number;

  @Column("int", { name: "itemIdx" })
  itemIdx: number;

  @Column("int", { name: "submitIdx" })
  submitIdx: number;

  @Column("int", { name: "rate" })
  rate: number;

  @Column("text", { name: "content" })
  content: string;

  @Column("text", { name: "images" })
  images: string;

  @Column("int", { name: "regdate" })
  regdate: number;

  @Column("text", { name: "content_a" })
  contentA: string;

  @Column("int", { name: "regdate_a" })
  regdateA: number;
}
