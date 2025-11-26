import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('webhook_events')
@Index(['eventId'], { unique: true })
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  eventId!: string;

  @Column()
  subscriptionId!: number;

  @Column()
  portalId!: number;

  @Column()
  eventType!: string;

  @Column({ nullable: true })
  objectId?: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  occurredAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}

