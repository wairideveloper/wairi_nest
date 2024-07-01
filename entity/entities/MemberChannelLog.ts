import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Member} from "./Member";

@Entity("memberChannelLog", { schema: "wairi" })
export class MemberChannelLog {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "memberIdx" })
  memberIdx: number;

  @Column("int", { name: "channelIdx" })
  channelIdx: number;

  @Column("int", { name: "channelType" })
  channelType: number;

  @Column("text", { name: "link" })
  link: string;

  @Column("int", { name: "regdate" })
  regdate: number;
}
