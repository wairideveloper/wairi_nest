import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("footprint", { schema: "wairi" })
export class Footprint {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "cookieId", length: 50 })
  cookieId: string;

  @Column("int", { name: "memberIdx" })
  memberIdx: number;

  @Column("int", { name: "memberType" })
  memberType: number;

  @Column("int", { name: "infIdx" })
  infIdx: number;

  @Column("varchar", { name: "codeFrom", length: 50 })
  codeFrom: string;

  @Column("varchar", { name: "codeTo", length: 50 })
  codeTo: string;

  @Column("int", { name: "regdate" })
  regdate: number;
}
