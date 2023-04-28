import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("cateArea", { schema: "wairi" })
export class CateArea {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "cateIdx" })
  cateIdx: number;

  @Column("varchar", { name: "name", length: 30 })
  name: string;

  @Column("int", { name: "ordering" })
  ordering: number;
}
