import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("marketing_result", { schema: "wairi" })
export class MarketingResult {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "visit" })
  visit: number;

  @Column("int", { name: "viewCount" })
  viewCount: number;

  @Column("int", { name: "salesCount" })
  salesCount: number;

  @Column("int", { name: "sales" })
  sales: number;

  @Column("varchar", { name: "regdate", length: 45 })
  regdate: string;
}
