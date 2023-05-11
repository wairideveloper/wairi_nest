import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Campaign} from "./Campaign";

@Entity("partner", { schema: "wairi" })
export class Partner {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "status" })
  status: number;

  @Column("varchar", { name: "corpName", length: 50 })
  corpName: string;

  @Column("varchar", { name: "corpCeo", length: 20 })
  corpCeo: string;

  @Column("varchar", { name: "corpTel", length: 30 })
  corpTel: string;

  @Column("varchar", { name: "attachBiz", length: 50 })
  attachBiz: string;

  @Column("tinyblob", { name: "contactName" })
  contactName: Buffer;

  @Column("tinyblob", { name: "contactPhone" })
  contactPhone: Buffer;

  @Column("blob", { name: "contactEmail" })
  contactEmail: Buffer;

  @Column("varchar", { name: "id", length: 20 })
  id: string;

  @Column("varchar", { name: "passwd", length: 100 })
  passwd: string;

  @Column("int", { name: "regdate" })
  regdate: number;

  @Column("int", { name: "exitdate" })
  exitdate: number;

  @Column("int", { name: "lastSignin" })
  lastSignin: number;

  @Column("int", { name: "exit_admin_idx" })
  exitAdminIdx: number;

  @Column("text", { name: "noteReceivers" })
  noteReceivers: string;

  @Column("float", {
    name: "depositPer",
    precision: 12,
    default: () => "'100'",
  })
  depositPer: number;

  @Column("float", { name: "dc11", precision: 12 })
  dc11: number;

  @Column("float", { name: "dc12", precision: 12 })
  dc12: number;

  @Column("float", { name: "dc21", precision: 12 })
  dc21: number;

  @Column("float", { name: "dc22", precision: 12 })
  dc22: number;

  @OneToOne(() => Campaign)
  campaign: Campaign;
}
