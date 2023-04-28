import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("testdb", { schema: "wairi" })
export class Testdb {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "regdate" })
  regdate: number;

  @Column("text", { name: "content1" })
  content1: string;

  @Column("text", { name: "content2" })
  content2: string;
}
