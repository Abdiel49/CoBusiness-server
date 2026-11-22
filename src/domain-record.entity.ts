import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'domain_records' })
@Index(['kind', 'recordId'], { unique: true })
export class DomainRecord {
  @PrimaryColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 80 }) kind!: string;
  @Column({ name: 'record_id', type: 'varchar', length: 160 })
  recordId!: string;
  @Column({ type: 'jsonb' }) payload!: Record<string, unknown>;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
