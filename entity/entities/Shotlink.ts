import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("shotlink", { schema: "wairi" })
export class Shotlink {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "infIdx" })
  infIdx: number;

  @Column("int", { name: "campaignIdx" })
  campaignIdx: number;

  @Column("int", { name: "submitIdx" })
  submitIdx: number;

  @Column("varchar", { name: "code", length: 45 })
  code: string;

  @Column("longtext", { name: "utmUrl" })
  utmUrl: string;

  @Column("int", { name: "channel" })
  channel: number;

  @Column("int", { name: "regdate" })
  regdate: number;
}
