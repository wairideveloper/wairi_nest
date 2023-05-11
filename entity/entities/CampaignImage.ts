import {Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Campaign} from "./Campaign";

@Index("item_idx", ["campaignIdx"], {})
@Entity("campaignImage", { schema: "wairi" })
export class CampaignImage {
  @PrimaryGeneratedColumn({ type: "int", name: "idx" })
  idx: number;

  @Column("int", { name: "campaignIdx" })
  campaignIdx: number;

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

  @ManyToOne((type) => Campaign, (Campaign) => Campaign.campaignImage)
  campaign: Campaign
}
