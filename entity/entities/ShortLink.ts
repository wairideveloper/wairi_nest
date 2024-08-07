import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shortLink', { schema: 'wairi' })
export class ShortLink {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'idx' })
  idx: number;

  @Column('bigint', { name: 'memberIdx' })
  memberIdx: number;

  @Column('varchar', { name: 'code', length: 100  })
  code: string;

  @Column('longtext', { name: 'returnUrl'})
  returnUrl: string;

  @Column('int', { name: 'count' })
  count: number;

  @Column('datetime', { name: 'created_at' })
  created_at: string;

}
