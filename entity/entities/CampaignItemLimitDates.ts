import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("itemIdx", ["itemIdx"], {})
@Entity("campaignItemLimitDates", { schema: "wairi" })
export class CampaignItemLimitDates {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "itemIdx" })
  itemIdx: number;

  @Column("int", { name: "date" })
  date: number;

  @Column("int", { name: "count" })
  count: number;
}
