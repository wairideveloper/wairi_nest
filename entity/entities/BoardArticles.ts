import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("boardArticles", { schema: "wairi" })
export class BoardArticles {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "boardIdx" })
  boardIdx: number;

  @Column("int", { name: "memberType" })
  memberType: number;

  @Column("varchar", { name: "title", length: 100 })
  title: string;

  @Column("longtext", { name: "content" })
  content: string;

  @Column("int", { name: "regdate" })
  regdate: number;
}
