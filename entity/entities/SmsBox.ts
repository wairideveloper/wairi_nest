import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("sms_box", { schema: "wairi" })
export class SmsBox {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "title", length: 100 })
  title: string;

  @Column("text", { name: "msg" })
  msg: string;

  @Column("varchar", { name: "regdate", length: 20 })
  regdate: string;
}
