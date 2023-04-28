import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("cs_faq", { schema: "wairi" })
export class CsFaq {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "title", length: 100 })
  title: string;

  @Column("longtext", { name: "content" })
  content: string;

  @Column("int", { name: "priority" })
  priority: number;
}
