import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Campaign} from "./Campaign";

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

  @OneToOne(() => Campaign)
  campaign: Campaign;
}
