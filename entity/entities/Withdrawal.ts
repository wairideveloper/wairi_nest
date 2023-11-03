import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('withdrawal', { schema: 'wairi' })
export class Withdrawal {
    @PrimaryGeneratedColumn({ type: 'int', name: 'idx' })
    idx: number;

    @Column("longtext", { name: "reason" })
    reason: string;

    @Column("varchar", { name: "use_yn", length: 1 })
    use_yn: string;
}
