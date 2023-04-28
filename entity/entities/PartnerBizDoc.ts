import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("partnerIdx", ["partnerIdx"], {})
@Entity("partnerBizDoc", { schema: "wairi" })
export class PartnerBizDoc {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "partnerIdx" })
  partnerIdx: number;

  @Column("varchar", { name: "fileName", length: 50 })
  fileName: string;

  @Column("varchar", { name: "origName", length: 200 })
  origName: string;

  @Column("int", { name: "regdate" })
  regdate: number;
}
