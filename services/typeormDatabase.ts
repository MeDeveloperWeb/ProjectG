import 'reflect-metadata';
import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { Message } from '@/entities/Message';
import { Contact } from '@/entities/Contact';
import { Setting } from '@/entities/Setting';
import { Notification } from '@/entities/Notification';
import { AppUsage } from '@/entities/AppUsage';

class TypeORMDatabaseService {
  private dataSource = AppDataSource;
  private messageRepository: Repository<Message>;
  private contactRepository: Repository<Contact>;
  private settingRepository: Repository<Setting>;
  private notificationRepository: Repository<Notification>;
  private appUsageRepository: Repository<AppUsage>;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    
    try {
      await this.dataSource.initialize();
      
      // Initialize repositories
      this.messageRepository = this.dataSource.getRepository(Message);
      this.contactRepository = this.dataSource.getRepository(Contact);
      this.settingRepository = this.dataSource.getRepository(Setting);
      this.notificationRepository = this.dataSource.getRepository(Notification);
      this.appUsageRepository = this.dataSource.getRepository(AppUsage);
      
      // Insert default data
      await this.insertDefaultData();
      
      this.isInitialized = true;
      console.log('TypeORM Database initialized successfully');
    } catch (error) {
      console.error('Error initializing TypeORM database:', error);
      throw error;
    }
  }

  private async insertDefaultData() {
    try {
      // Insert default contacts
      const contactCount = await this.contactRepository.count();
      if (contactCount === 0) {
        const defaultContacts = [
          { name: 'Alice Johnson', phone: '+1 (555) 123-4567' },
          { name: 'Bob Smith', phone: '+1 (555) 987-6543' },
          { name: 'Carol Davis', phone: '+1 (555) 456-7890' },
        ];
        
        for (const contactData of defaultContacts) {
          const contact = this.contactRepository.create(contactData);
          await this.contactRepository.save(contact);
        }
      }

      // Insert default messages
      const messageCount = await this.messageRepository.count();
      if (messageCount === 0) {
        const now = Date.now();
        const defaultMessages = [
          { sender: 'Alice Johnson', content: 'Hey! How are you doing?', timestamp: now - 3600000, isRead: false },
          { sender: 'Bob Smith', content: "Don't forget about our meeting tomorrow!", timestamp: now - 1800000, isRead: false },
          { sender: 'Carol Davis', content: 'Thanks for your help yesterday 😊', timestamp: now - 900000, isRead: false },
        ];
        
        for (const messageData of defaultMessages) {
          const message = this.messageRepository.create(messageData);
          await this.messageRepository.save(message);
        }
      }

      // Insert default settings
      const settingCount = await this.settingRepository.count();
      if (settingCount === 0) {
        const defaultSettings = [
          { key: 'theme', value: 'light' },
          { key: 'notifications', value: 'true' },
          { key: 'sound', value: 'true' },
          { key: 'userName', value: 'Player' },
        ];
        
        for (const settingData of defaultSettings) {
          const setting = this.settingRepository.create(settingData);
          await this.settingRepository.save(setting);
        }
      }

      // Insert default notifications
      const notificationCount = await this.notificationRepository.count();
      if (notificationCount === 0) {
        const now = Date.now();
        const defaultNotifications = [
          { 
            title: 'New Message', 
            body: 'Alice Johnson: Hey! How are you doing?', 
            appName: 'Messages', 
            timestamp: now - 3600000, 
            type: 'message' as const,
            isRead: false 
          },
          { 
            title: 'System Update', 
            body: 'Your phone simulator has been updated to version 1.0.1', 
            appName: 'System', 
            timestamp: now - 7200000, 
            type: 'system' as const,
            isRead: false 
          },
          { 
            title: 'Contact Added', 
            body: 'Bob Smith has been added to your contacts', 
            appName: 'Contacts', 
            timestamp: now - 10800000, 
            type: 'app' as const,
            isRead: false 
          },
        ];
        
        for (const notificationData of defaultNotifications) {
          const notification = this.notificationRepository.create(notificationData);
          await this.notificationRepository.save(notification);
        }
      }
    } catch (error) {
      console.error('Error inserting default data:', error);
    }
  }

  // Messages methods
  async getMessages(): Promise<Message[]> {
    if (!this.isInitialized) await this.init();
    return await this.messageRepository.find({
      order: { timestamp: 'DESC' }
    });
  }

  async addMessage(sender: string, content: string): Promise<Message> {
    if (!this.isInitialized) await this.init();
    const message = this.messageRepository.create({
      sender,
      content,
      timestamp: Date.now(),
      isRead: false
    });
    return await this.messageRepository.save(message);
  }

  async markMessageAsRead(id: number): Promise<void> {
    if (!this.isInitialized) await this.init();
    await this.messageRepository.update(id, { isRead: true });
  }

  // Contacts methods
  async getContacts(): Promise<Contact[]> {
    if (!this.isInitialized) await this.init();
    return await this.contactRepository.find({
      order: { name: 'ASC' }
    });
  }

  async addContact(name: string, phone: string, avatar?: string): Promise<Contact> {
    if (!this.isInitialized) await this.init();
    const contact = this.contactRepository.create({
      name,
      phone,
      avatar
    });
    return await this.contactRepository.save(contact);
  }

  // Settings methods
  async getSetting(key: string): Promise<string | null> {
    if (!this.isInitialized) await this.init();
    const setting = await this.settingRepository.findOne({ where: { key } });
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    if (!this.isInitialized) await this.init();
    let setting = await this.settingRepository.findOne({ where: { key } });
    
    if (setting) {
      setting.value = value;
    } else {
      setting = this.settingRepository.create({ key, value });
    }
    
    await this.settingRepository.save(setting);
  }

  // Notifications methods
  async getNotifications(): Promise<Notification[]> {
    if (!this.isInitialized) await this.init();
    return await this.notificationRepository.find({
      order: { timestamp: 'DESC' }
    });
  }

  async addNotification(
    title: string, 
    body: string, 
    appName: string, 
    type: 'message' | 'system' | 'app' = 'system'
  ): Promise<Notification> {
    if (!this.isInitialized) await this.init();
    const notification = this.notificationRepository.create({
      title,
      body,
      appName,
      timestamp: Date.now(),
      type,
      isRead: false
    });
    return await this.notificationRepository.save(notification);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    if (!this.isInitialized) await this.init();
    await this.notificationRepository.update(id, { isRead: true });
  }

  async clearAllNotifications(): Promise<void> {
    if (!this.isInitialized) await this.init();
    await this.notificationRepository.delete({});
  }

  async getUnreadNotificationsCount(): Promise<number> {
    if (!this.isInitialized) await this.init();
    return await this.notificationRepository.count({ where: { isRead: false } });
  }

  // App usage methods
  async updateAppUsage(appName: string, usageTime: number): Promise<void> {
    if (!this.isInitialized) await this.init();
    let appUsage = await this.appUsageRepository.findOne({ where: { appName } });
    
    if (appUsage) {
      appUsage.usageTime = usageTime;
      appUsage.lastUsed = Date.now();
    } else {
      appUsage = this.appUsageRepository.create({
        appName,
        usageTime,
        lastUsed: Date.now()
      });
    }
    
    await this.appUsageRepository.save(appUsage);
  }

  async getAppUsage(): Promise<AppUsage[]> {
    if (!this.isInitialized) await this.init();
    return await this.appUsageRepository.find({
      order: { lastUsed: 'DESC' }
    });
  }

  // Close connection
  async close(): Promise<void> {
    if (this.isInitialized && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.isInitialized = false;
    }
  }
}

export const typeORMDatabaseService = new TypeORMDatabaseService();
