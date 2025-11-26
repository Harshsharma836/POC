import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('contacts')
@Index(['hubspotId'], { unique: true })
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  hubspotId!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  jobTitle?: string;

  @Column({ type: 'jsonb', nullable: true })
  properties?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

