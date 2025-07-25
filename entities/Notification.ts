import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'text' })
  appName: string;

  @Column({ type: 'bigint' })
  timestamp: number;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'text', default: 'system' })
  type: 'message' | 'system' | 'app';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
