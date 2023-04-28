import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin', { schema: 'wairi' })
export class Admin {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx' })
  idx: number;

  @Column('int', { name: 'level', default: () => "'9'" })
  level: number;

  @Column('varchar', { name: 'id', length: 20 })
  id: string;

  @Column('varchar', { name: 'passwd', length: 100 })
  passwd: string;

  @Column('varchar', { name: 'name', length: 30 })
  name: string;

  @Column('blob', { name: 'phone' })
  phone: Buffer;

  @Column('int', { name: 'receive_sms' })
  receiveSms: number;
}
