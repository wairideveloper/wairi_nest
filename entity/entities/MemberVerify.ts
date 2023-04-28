import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("memberVerify", { schema: "wairi" })
export class MemberVerify {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "type", length: 10, default: () => "'phone'" })
  type: string;

  @Column("int", { name: "check_result", default: () => "'0'" })
  checkResult: number;

  @Column("varchar", { name: "check_key", length: 50 })
  checkKey: string;

  @Column("varchar", { name: "check_num", length: 6 })
  checkNum: string;

  @Column("blob", { name: "phone" })
  phone: Buffer;

  @Column("blob", { name: "email" })
  email: Buffer;

  @Column("varchar", { name: "regdate", length: 20 })
  regdate: string;

  @Column("varchar", { name: "expiredate", length: 20 })
  expiredate: string;

  @Column("varchar", { name: "user_ip", length: 50 })
  userIp: string;

  @Column("int", { name: "sms_result", default: () => "'0'" })
  smsResult: number;
}
