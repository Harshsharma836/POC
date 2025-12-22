import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  constructor(partial: Partial<User> = {}) {
    Object.assign(this, partial);
  }
}