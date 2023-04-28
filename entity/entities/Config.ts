import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("config", { schema: "wairi" })
export class Config {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "title", length: 50 })
  title: string;

  @Column("varchar", { name: "cfg_key", length: 50 })
  cfgKey: string;

  @Column("longtext", { name: "cfg_value" })
  cfgValue: string;

  @Column("varchar", { name: "input_type", length: 10 })
  inputType: string;

  @Column("int", { name: "ordering" })
  ordering: number;
}
