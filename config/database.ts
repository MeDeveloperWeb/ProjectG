import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Message } from '@/entities/Message';
import { Contact } from '@/entities/Contact';
import { Setting } from '@/entities/Setting';
import { Notification } from '@/entities/Notification';
import { AppUsage } from '@/entities/AppUsage';

export const AppDataSource = new DataSource({
  type: 'react-native',
  database: 'phone_simulator.db',
  location: 'default',
  logging: false,
  synchronize: true,
  entities: [Message, Contact, Setting, Notification, AppUsage],
  migrations: [],
  subscribers: [],
});
