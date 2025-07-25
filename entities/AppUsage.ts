import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('app_usage')
export class AppUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  appName: string;

  @Column({ type: 'integer', default: 0 })
  usageTime: number;

  @Column({ type: 'bigint' })
  lastUsed: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
