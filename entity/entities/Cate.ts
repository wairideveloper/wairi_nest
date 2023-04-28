import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("cate", { schema: "wairi" })
export class Cate {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "name", length: 30 })
  name: string;

  @Column("varchar", { name: "icon", length: 50 })
  icon: string;

  @Column("int", { name: "ordering" })
  ordering: number;

  @Column("int", { name: "memberType" })
  memberType: number;

  @Column("int", { name: "signinRequire" })
  signinRequire: number;

  @Column("int", { name: "notEditable" })
  notEditable: number;

  @Column("varchar", { name: "type", length: 20 })
  type: string;
}
