import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("popup", { schema: "wairi" })
export class Popup {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "page", length: 20 })
  page: string;

  @Column("int", { name: "memberType" })
  memberType: number;

  @Column("int", { name: "device", comment: "1:PC, 2:MOBILE" })
  device: number;

  @Column("int", { name: "device_pc" })
  devicePc: number;

  @Column("int", { name: "device_mobile" })
  deviceMobile: number;

  @Column("longtext", { name: "content" })
  content: string;

  @Column("int", { name: "w_width" })
  wWidth: number;

  @Column("int", { name: "w_height" })
  wHeight: number;

  @Column("int", { name: "w_padding" })
  wPadding: number;

  @Column("varchar", { name: "title", length: 100 })
  title: string;

  @Column("int", { name: "is_center" })
  isCenter: number;

  @Column("int", { name: "is_bg" })
  isBg: number;

  @Column("int", { name: "pos_x" })
  posX: number;

  @Column("int", { name: "pos_y" })
  posY: number;

  @Column("varchar", { name: "bg_color", length: 10 })
  bgColor: string;

  @Column("varchar", { name: "bg_opacity", length: 10 })
  bgOpacity: string;

  @Column("int", { name: "display", default: () => "'1'" })
  display: number;

  @Column("varchar", { name: "expiredate", length: 20 })
  expiredate: string;
}
