import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pushLog', { schema: 'wairi' })
export class PushLog {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx' })
  idx: number;

  @Column('int', { name: 'memberIdx' })
  memberIdx: number;

  @Column('text', { name: 'title' })
  title: string;

  @Column('text', { name: 'subTitle' })
  subTitle: string;

  @Column('boolean', { name: 'isRead' })
  isRead: boolean;

  @Column('text', { name: 'roomName' })
  roomName: string;

  @Column('text', { name: 'roomIdx' })
  roomIdx: string;

  @Column('text', { name: 'category' })
  category: string;

  @Column('timestamp', { name: 'created_at' })
  created_at: string;
}
