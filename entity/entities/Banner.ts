import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("banner", { schema: "wairi" })
export class Banner {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "pageCode" })
  pageCode: number;

  @Column("varchar", { name: "code", length: 30, default: () => "'main'" })
  code: string;

  @Column("varchar", { name: "image", length: 50 })
  image: string;

  @Column("varchar", { name: "name", length: 50 })
  name: string;

  @Column("int", { name: "regdate" })
  regdate: number;

  @Column("int", { name: "ordering" })
  ordering: number;

  @Column("varchar", { name: "link" })
  link: string;

  @Column("varchar", { name: "native_link" })
  native_link: string;
}
