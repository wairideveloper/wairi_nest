import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {CampaignItem} from "./CampaignItem";

@Index("date", ["date"], {})
@Index("itemIdx", ["itemIdx"], {})
@Entity("campaignItemSchedule", {schema: "wairi"})
export class CampaignItemSchedule {
    @PrimaryGeneratedColumn({type: "int", name: "idx"})
    idx: number;

    @Column("int", {name: "date"})
    date: number;

    @Column("int", {name: "itemIdx"})
    itemIdx: number;

    @Column("int", {name: "status"})
    status: number;

    @Column("int", {name: "stock"})
    stock: number;

    @Column("int", {name: "priceDeposit"})
    priceDeposit: number;

@ManyToOne(() => CampaignItem, (campaignItem) => campaignItem.campaignItemSchedule)
@JoinColumn([{name: "itemIdx", referencedColumnName: "idx"}])
campaignItem: CampaignItem;
}
