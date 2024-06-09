import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("notificationTalkCallBack", { schema: "wairi" })
export class NotificationTalkCallBack {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "status", length: 20 })
  status: string;

  @Column("varchar", { name: "template_code", length: 20 })
  template_code: string;

  @Column("varchar", { name: "echo_to_webhook", length: 50 })
  echo_to_webhook: string;

  @Column("datetime", { name: "done_date" })
  done_date: string;

  @Column("datetime", { name: "created_at" })
  created_at: string;
}
