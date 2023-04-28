import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("indexBtn", { schema: "wairi" })
export class IndexBtn {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "name", length: 50 })
  name: string;

  @Column("text", { name: "url" })
  url: string;

  @Column("int", { name: "ordering" })
  ordering: number;
}
