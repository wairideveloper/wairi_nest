import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Campaign} from "./Campaign";
import {Cate} from "./Cate";

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

  @ManyToOne(() => Cate, (cate) => cate.cateArea) // 여기서 cateArea는 엔터티 클래스에서 정의한 변수 이름이어야 합니다.
  @JoinColumn({ name: "cateIdx", referencedColumnName: "idx" }) // joinColumns 설정 대신 JoinColumn을 사용합니다.
  cate: Cate;
}
