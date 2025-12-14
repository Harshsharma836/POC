import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface NotificationData {
  title: string;
  message: string;
  type?: string;
  metadata?: Record<string, any>;
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  userId!: string;

  @Column({ type: 'jsonb' })
  data!: NotificationData;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }
}
