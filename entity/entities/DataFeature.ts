import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("dataFeature", { schema: "wairi" })
export class DataFeature {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "name", length: 30 })
  name: string;

  @Column("varchar", { name: "icon", length: 50 })
  icon: string;

  @Column("int", { name: "ordering" })
  ordering: number;
}
