import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('companies')
@Index(['hubspotId'], { unique: true })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  hubspotId!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  domain?: string;

  @Column({ nullable: true })
  industry?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'jsonb', nullable: true })
  properties?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

