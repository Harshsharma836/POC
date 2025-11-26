import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('deals')
@Index(['hubspotId'], { unique: true })
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  hubspotId!: string;

  @Column({ nullable: true })
  dealName?: string;

  @Column({ nullable: true })
  dealStage?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount?: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ nullable: true })
  pipeline?: string;

  @Column({ nullable: true })
  closeDate?: Date;

  @Column({ nullable: true })
  dealType?: string;

  @Column({ type: 'jsonb', nullable: true })
  properties?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

