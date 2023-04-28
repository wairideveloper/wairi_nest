import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("emailTemplate", { schema: "wairi" })
export class EmailTemplate {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "code", length: 30 })
  code: string;

  @Column("varchar", { name: "title", length: 50 })
  title: string;

  @Column("varchar", { name: "sendTitle", length: 100 })
  sendTitle: string;

  @Column("longtext", { name: "content" })
  content: string;
}
