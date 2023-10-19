import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("memberChannel", { schema: "wairi" })
export class MemberChannel {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "memberIdx" })
  memberIdx: number;

  @Column("int", { name: "type" })
  type: number;

  @Column("varchar", { name: "typeText", length: 20 })
  typeText: string;

  @Column("text", { name: "link" })
  link: string;

  @Column("int", { name: "regdate" })
  regdate: number;

  @Column("int", { name: "level" })
  level: number;

  @Column("int", { name: "interests" })
  interests: number;
    date: string;
}
