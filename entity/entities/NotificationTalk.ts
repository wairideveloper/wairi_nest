import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("notificationTalk", { schema: "wairi" })
export class NotificationTalk {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("varchar", { name: "status", length: 20 })
  status: string;

  @Column("varchar", { name: "template_code", length: 20 })
  template_code: string;

  @Column("varchar", { name: "echo_to_webhook", length: 50 })
  echo_to_webhook: string;

  @Column("longtext", { name: "message" })
  message: string;

  @Column("varchar", { name: "receiver_number", length: 20 })
  receiver_number: string;

  @Column("longtext", { name: "reason" })
  reason: string;

  @Column("longtext", { name: "data" })
  data: string;

  @Column("datetime", { name: "created_at" })
  created_at: string;

  @Column("datetime", { name: "updated_at" })
  updated_at: string;

  @Column("datetime", { name: "done_date" })
  done_date: string;
}
