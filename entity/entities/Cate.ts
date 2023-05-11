import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {CampaignItem} from "./CampaignItem";
import {Campaign} from "./Campaign";

@Entity("cate", { schema: "wairi" })
export class Cate {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "name", length: 30 })
  name: string;

  @Column("varchar", { name: "icon", length: 50 })
  icon: string;

  @Column("int", { name: "ordering" })
  ordering: number;

  @Column("int", { name: "memberType" })
  memberType: number;

  @Column("int", { name: "signinRequire" })
  signinRequire: number;

  @Column("int", { name: "notEditable" })
  notEditable: number;

  @Column("varchar", { name: "type", length: 20 })
  type: string;

  @OneToOne(() => Campaign)
  campaign: Campaign;

}
