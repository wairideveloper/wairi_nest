import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("sms_template", { schema: "wairi" })
export class SmsTemplate {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "code", length: 20 })
  code: string;

  @Column("varchar", { name: "title", length: 50 })
  title: string;

  @Column("int", { name: "is_user" })
  isUser: number;

  @Column("int", { name: "is_admin" })
  isAdmin: number;

  @Column("text", { name: "to_user" })
  toUser: string;

  @Column("text", { name: "to_admin" })
  toAdmin: string;

  @Column("text", { name: "note" })
  note: string;
}
