import * as SQLite from 'expo-sqlite';

export interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar?: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
}

export interface AppUsage {
  id: number;
  appName: string;
  usageTime: number;
  lastUsed: number;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  appName: string;
  timestamp: number;
  isRead: boolean;
  type: 'message' | 'system' | 'app';
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (this.db) return;
    
    this.db = await SQLite.openDatabaseAsync('phone_simulator.db');
    await this.createTables();
  }

  private async createTables() {
    if (!this.db) return;

    // Messages table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        isRead INTEGER DEFAULT 0
      );
    `);

    // Contacts table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        avatar TEXT
      );
    `);

    // Settings table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
    `);

    // App usage table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appName TEXT NOT NULL,
        usageTime INTEGER DEFAULT 0,
        lastUsed INTEGER NOT NULL
      );
    `);

    // Notifications table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        appName TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        isRead INTEGER DEFAULT 0,
        type TEXT NOT NULL DEFAULT 'system'
      );
    `);

    // Insert default data
    await this.insertDefaultData();
  }

  private async insertDefaultData() {
    if (!this.db) return;

    // Insert default contacts
    const contactExists = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM contacts');
    if ((contactExists as any)?.count === 0) {
      await this.db.runAsync(
        'INSERT INTO contacts (name, phone) VALUES (?, ?)',
        'Alice Johnson', '+1 (555) 123-4567'
      );
      await this.db.runAsync(
        'INSERT INTO contacts (name, phone) VALUES (?, ?)',
        'Bob Smith', '+1 (555) 987-6543'
      );
      await this.db.runAsync(
        'INSERT INTO contacts (name, phone) VALUES (?, ?)',
        'Carol Davis', '+1 (555) 456-7890'
      );
    }

    // Insert default messages
    const messageExists = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM messages');
    if ((messageExists as any)?.count === 0) {
      const now = Date.now();
      await this.db.runAsync(
        'INSERT INTO messages (sender, content, timestamp) VALUES (?, ?, ?)',
        'Alice Johnson', 'Hey! How are you doing?', now - 3600000
      );
      await this.db.runAsync(
        'INSERT INTO messages (sender, content, timestamp) VALUES (?, ?, ?)',
        'Bob Smith', 'Don\'t forget about our meeting tomorrow!', now - 1800000
      );
      await this.db.runAsync(
        'INSERT INTO messages (sender, content, timestamp) VALUES (?, ?, ?)',
        'Carol Davis', 'Thanks for your help yesterday 😊', now - 900000
      );
    }

    // Insert default settings
    const settingsExist = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM settings');
    if ((settingsExist as any)?.count === 0) {
      await this.db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        'theme', 'light'
      );
      await this.db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        'notifications', 'true'
      );
      await this.db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        'sound', 'true'
      );
      await this.db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        'userName', 'Player'
      );
    }

    // Insert default notifications
    const notificationsExist = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM notifications');
    if ((notificationsExist as any)?.count === 0) {
      const now = Date.now();
      await this.db.runAsync(
        'INSERT INTO notifications (title, body, appName, timestamp, type) VALUES (?, ?, ?, ?, ?)',
        'New Message', 'Alice Johnson: Hey! How are you doing?', 'Messages', now - 3600000, 'message'
      );
      await this.db.runAsync(
        'INSERT INTO notifications (title, body, appName, timestamp, type) VALUES (?, ?, ?, ?, ?)',
        'System Update', 'Your phone simulator has been updated to version 1.0.1', 'System', now - 7200000, 'system'
      );
      await this.db.runAsync(
        'INSERT INTO notifications (title, body, appName, timestamp, type) VALUES (?, ?, ?, ?, ?)',
        'Contact Added', 'Bob Smith has been added to your contacts', 'Contacts', now - 10800000, 'app'
      );
    }
  }

  // Messages methods
  async getMessages(): Promise<Message[]> {
    if (!this.db) await this.init();
    const result = await this.db!.getAllAsync('SELECT * FROM messages ORDER BY timestamp DESC');
    return result as Message[];
  }

  async addMessage(sender: string, content: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.runAsync(
      'INSERT INTO messages (sender, content, timestamp) VALUES (?, ?, ?)',
      [sender, content, Date.now()]
    );
  }

  async markMessageAsRead(id: number): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.runAsync('UPDATE messages SET isRead = 1 WHERE id = ?', [id]);
  }

  // Contacts methods
  async getContacts(): Promise<Contact[]> {
    if (!this.db) await this.init();
    const result = await this.db!.getAllAsync('SELECT * FROM contacts ORDER BY name');
    return result as Contact[];
  }

  async addContact(name: string, phone: string, avatar?: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.runAsync(
      'INSERT INTO contacts (name, phone, avatar) VALUES (?, ?, ?)',
      [name, phone, avatar || null]
    );
  }

  // Settings methods
  async getSetting(key: string): Promise<string | null> {
    if (!this.db) await this.init();
    const result = await this.db!.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]);
    return (result as any)?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  }

  // App usage methods
  async updateAppUsage(appName: string, usageTime: number): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.runAsync(
      'INSERT OR REPLACE INTO app_usage (appName, usageTime, lastUsed) VALUES (?, ?, ?)',
      [appName, usageTime, Date.now()]
    );
  }

  async getAppUsage(): Promise<AppUsage[]> {
    if (!this.db) await this.init();
    const result = await this.db!.getAllAsync('SELECT * FROM app_usage ORDER BY lastUsed DESC');
    return result as AppUsage[];
  }

  // Notifications methods
  async getNotifications(): Promise<Notification[]> {
    if (!this.db) await this.init();
    const result = await this.db!.getAllAsync('SELECT * FROM notifications ORDER BY timestamp DESC');
    return result as Notification[];
  }

  async addNotification(title: string, body: string, appName: string, type: 'message' | 'system' | 'app' = 'system'): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.runAsync(
      'INSERT INTO notifications (title, body, appName, timestamp, type) VALUES (?, ?, ?, ?, ?)',
      [title, body, appName, Date.now(), type]
    );
  }

  async markNotificationAsRead(id: number): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.runAsync('UPDATE notifications SET isRead = 1 WHERE id = ?', [id]);
  }

  async clearAllNotifications(): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.runAsync('DELETE FROM notifications');
  }

  async getUnreadNotificationsCount(): Promise<number> {
    if (!this.db) await this.init();
    const result = await this.db!.getFirstAsync('SELECT COUNT(*) as count FROM notifications WHERE isRead = 0');
    return (result as any)?.count || 0;
  }
}

export const databaseService = new DatabaseService();