import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

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
}
