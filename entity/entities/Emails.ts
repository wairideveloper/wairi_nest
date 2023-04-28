import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("emails", { schema: "wairi" })
export class Emails {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "code", length: 30 })
  code: string;

  @Column("varchar", { name: "receiver", length: 100 })
  receiver: string;

  @Column("varchar", { name: "title", length: 200 })
  title: string;

  @Column("longtext", { name: "content" })
  content: string;

  @Column("varchar", { name: "resultCode", length: 20 })
  resultCode: string;

  @Column("varchar", { name: "resultMsg", length: 100 })
  resultMsg: string;

  @Column("int", { name: "regdate" })
  regdate: number;
}
