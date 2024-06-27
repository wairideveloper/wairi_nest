import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("memberDevice", {schema: "wairi"})
export class MemberDevice {
    @PrimaryGeneratedColumn({type: "int", name: "idx"})
    idx: number;

    @Column('varchar', { name: 'device_id' })
    device_id: string;

    @Column('int', { name: 'memberIdx' })
    memberIdx: number;

    @Column('varchar', { name: 'platform' })
    platform: string;

    @Column('varchar', { name: 'device_token' })
    device_token: string;

    @Column('boolean', {name: 'event', default: 0})
    event: boolean;

    @Column('boolean', {name: 'action', default: 0})
    action: boolean;

    @Column('boolean', {name: 'night', default: 0})
    night: boolean;

    @Column("datetime", { name: "created_at" })
    created_at: string;

    @Column("datetime", { name: "updated_at" })
    updated_at: string;
}
