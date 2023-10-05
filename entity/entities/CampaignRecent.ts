import {Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {CateArea} from "./CateArea";
import {Campaign} from "./Campaign";

@Index("memberIdx", ["memberIdx"], {})
@Index("campaignIdx", ["campaignIdx"], {})
@Entity("campaignRecent", { schema: "wairi" })
export class CampaignRecent {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "memberIdx" })
  memberIdx: number;

  @Column("int", { name: "memberType" })
  memberType: number;

  @Column("int", { name: "campaignIdx" })
  campaignIdx: number;

  @Column("int", { name: "regdate" })
  regdate: number;

  @Column("int", { name: "ymd" })
  ymd: string;

  @Column("varchar", { name: "ip", length: 30 })
  ip: string;

  @Column("text", { name: "referer" })
  referer: string;

  @Column("varchar", { name: "refererHost", length: 200 })
  refererHost: string;

  @Column("int", { name: "isSelf" })
  isSelf: number;

  @Column("int", { name: "infIdx" })
  infIdx: number;

  @Column("int", { name: "isUtm" })
  isUtm: number;

  @Column("varchar", { name: "utmInfName", length: 50 })
  utmInfName: string;

  @Column("int", { name: "utmInfIdx" })
  utmInfIdx: number;

  @OneToOne(() => Campaign)
  @JoinColumn({name: 'campaignIdx', referencedColumnName: 'idx'})
  campaign: Campaign;
}
