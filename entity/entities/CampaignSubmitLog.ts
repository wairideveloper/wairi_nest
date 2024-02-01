import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity("campaignSubmitLog", { schema: "wairi" })
export class CampaignSubmitLog {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "submitIdx"})
  submitIdx: number;

  @Column("int", { name: "memberIdx"})
  memberIdx: number;

  @Column("int", { name: "status"})
  status: number;

  @Column("int", { name: "statusTo"})
  statusTo: number;

  @Column("datetime", { name: "created_at" })
  created_at: string;
}
