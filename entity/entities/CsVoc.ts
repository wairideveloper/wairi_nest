import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("cs_voc", { schema: "wairi" })
export class CsVoc {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "member_idx" })
  memberIdx: number;

  @Column("varchar", { name: "title", length: 100 })
  title: string;

  @Column("text", { name: "content" })
  content: string;

  @Column("text", { name: "content_a" })
  contentA: string;

  @Column("varchar", { name: "regdate", length: 20 })
  regdate: string;

  @Column("int", { name: "a_admin_idx" })
  aAdminIdx: number;

  @Column("varchar", { name: "a_regdate", length: 20 })
  aRegdate: string;

  @Column("int", { name: "noti_user" })
  notiUser: number;

  @Column("int", { name: "noti_admin" })
  notiAdmin: number;
}
