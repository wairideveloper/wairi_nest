import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("cs_notice", { schema: "wairi" })
export class CsNotice {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "admin_idx" })
  adminIdx: number;

  @Column("varchar", { name: "title", length: 100 })
  title: string;

  @Column("longtext", { name: "content" })
  content: string;

  @Column("varchar", { name: "regdate", length: 20 })
  regdate: string;

  @Column("int", { name: "fixed" })
  fixed: number;

  @Column("int", { name: "main_pop" })
  mainPop: number;
}
