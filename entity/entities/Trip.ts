import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("trip", { schema: "wairi" })
export class Trip {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "allianceid" })
  allianceid: number;

  @Column("int", { name: "sid" })
  sid: number;

  @Column("varchar", { name: "ouid", length: 50 })
  ouid: string;

  @Column("bigint", { name: "orderid" })
  orderid: string;

  @Column("text", { name: "ordername" })
  ordername: string;

  @Column("varchar", { name: "orderstatusid", length: 100 })
  orderstatusid: string;

  @Column("varchar", { name: "ordertype", length: 50 })
  ordertype: string;

  @Column("decimal", { name: "orderamount", precision: 10, scale: 2 })
  orderamount: string;

  @Column("text", { name: "uuid" })
  uuid: string;

  @Column("int", { name: "orderdate" })
  orderdate: number;

  @Column("int", { name: "startdatetime" })
  startdatetime: number;

  @Column("int", { name: "enddatetime" })
  enddatetime: number;

  @Column("int", { name: "pushdate" })
  pushdate: number;

  @Column("int", { name: "regdate" })
  regdate: number;

  @Column("int", { name: "cancel" })
  cancel: number;
}
