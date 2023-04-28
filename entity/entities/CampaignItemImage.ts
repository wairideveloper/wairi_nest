import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("item_idx", ["itemIdx"], {})
@Entity("campaignItemImage", { schema: "wairi" })
export class CampaignItemImage {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "itemIdx" })
  itemIdx: number;

  @Column("varchar", { name: "file_name", length: 50 })
  fileName: string;

  @Column("varchar", { name: "orig_name", length: 255 })
  origName: string;

  @Column("int", { name: "ordering" })
  ordering: number;

  @Column("int", { name: "cropX" })
  cropX: number;

  @Column("int", { name: "cropY" })
  cropY: number;

  @Column("int", { name: "cropWidth" })
  cropWidth: number;

  @Column("int", { name: "cropHeight" })
  cropHeight: number;

  @Column("int", { name: "hasOrig", default: () => "'1'" })
  hasOrig: number;
}
