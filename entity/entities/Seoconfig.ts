import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("seoconfig", { schema: "wairi" })
export class Seoconfig {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "cateIdx", nullable: true })
  cateIdx: number | null;

  @Column("int", { name: "cateAreaIdx", nullable: true })
  cateAreaIdx: number | null;

  @Column("int", { name: "campaignIdx", default: () => "'0'" })
  campaignIdx: number;

  @Column("varchar", { name: "title", length: 255 })
  title: string;

  @Column("longtext", { name: "description" })
  description: string;

  @Column("varchar", { name: "keyword", nullable: true, length: 255 })
  keyword: string | null;

  @Column("varchar", { name: "img", nullable: true, length: 255 })
  img: string | null;

  @Column("longtext", { name: "url", nullable: true })
  url: string | null;

  @Column("int", { name: "display", default: () => "'0'" })
  display: number;

  @Column("int", { name: "regdate" })
  regdate: number;
}
