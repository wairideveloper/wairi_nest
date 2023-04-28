import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("payment", { schema: "wairi" })
export class Payment {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "status" })
  status: number;

  @Column("varchar", { name: "oid", length: 30 })
  oid: string;

  @Column("int", { name: "memberIdx" })
  memberIdx: number;

  @Column("int", { name: "submitIdx" })
  submitIdx: number;

  @Column("int", { name: "payTotal" })
  payTotal: number;

  @Column("int", { name: "payAmount" })
  payAmount: number;

  @Column("varchar", { name: "receiptId", length: 30 })
  receiptId: string;

  @Column("varchar", { name: "payMethod", length: 10 })
  payMethod: string;

  @Column("int", { name: "regdate" })
  regdate: number;

  @Column("int", { name: "paydate" })
  paydate: number;

  @Column("varchar", { name: "itemName", length: 100 })
  itemName: string;

  @Column("varchar", { name: "msg", length: 100 })
  msg: string;

  @Column("varchar", { name: "cardName", length: 20 })
  cardName: string;

  @Column("varchar", { name: "cardNum", length: 30 })
  cardNum: string;

  @Column("varchar", { name: "vbankCode", length: 10 })
  vbankCode: string;

  @Column("varchar", { name: "vbankNum", length: 50 })
  vbankNum: string;

  @Column("int", { name: "vbankExpire" })
  vbankExpire: number;

  @Column("varchar", {
    name: "refundAcctNo",
    comment: "환불계좌번호",
    length: 30,
  })
  refundAcctNo: string;

  @Column("varchar", {
    name: "refundBankCd",
    comment: "환불계좌은행",
    length: 4,
  })
  refundBankCd: string;

  @Column("varchar", {
    name: "refundAcctNm",
    comment: "환불계좌예금주",
    length: 20,
  })
  refundAcctNm: string;
}
