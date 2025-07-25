# Database ORM Architecture

## Overview
The database has been refactored from a monolithic service into a clean ORM-like structure with separated concerns and better maintainability.

## Structure

### Schema Definition (`services/database/schema.ts`)
- Contains all table schemas with enhanced field definitions
- Includes performance indexes for better query optimization
- Centralized database initialization with proper error handling
- Enhanced schemas with timestamps, categories, and additional fields

### Base Model (`services/database/BaseModel.ts`)
- Abstract base class providing common CRUD operations
- Generic type support for type safety
- Common methods: `create()`, `findById()`, `findAll()`, `deleteById()`, `count()`, etc.
- Query options support for filtering, ordering, limiting
- Handles automatic timestamp management

### Model Classes (`services/database/models.ts`)
Each table has its own model class extending BaseModel:

#### MessageModel
- **Purpose**: Manages message data with thread support
- **Key Methods**: 
  - `markAsRead()` - Mark messages as read
  - `getUnreadCount()` - Get count of unread messages
  - `getByThread()` - Get messages by thread ID
  - `getLatestByThreads()` - Get latest message per thread
- **Data Format**:
  ```typescript
  {
    sender: string;
    content: string;
    timestamp?: number;
    is_read?: number;
    thread_id?: string;
    message_type?: 'text' | 'image' | 'emoji';
  }
  ```

#### ContactModel
- **Purpose**: Manages contact information with favorites and categories
- **Key Methods**: 
  - `toggleFavorite()` - Toggle favorite status
  - `getFavorites()` - Get favorite contacts
  - `search()` - Search by name or phone
  - `getByCategory()` - Filter by category
- **Data Format**:
  ```typescript
  {
    name: string;
    phone: string;
    email?: string;
    avatar?: string;
    is_favorite?: number;
    category?: string;
    notes?: string;
  }
  ```

#### SettingModel
- **Purpose**: Manages application settings with categories
- **Key Methods**: 
  - `getByKey()` - Get setting by key
  - `upsert()` - Update or create setting
  - `getValue()` - Get setting value with default
  - `getByCategory()` - Get settings by category
- **Data Format**:
  ```typescript
  {
    key: string;
    value: string;
    category?: string;
    description?: string;
  }
  ```

#### NotificationModel
- **Purpose**: Manages notifications with priority and app grouping
- **Key Methods**: 
  - `markAsRead()` - Mark notifications as read
  - `getUnreadCountByApp()` - Get unread count grouped by app
  - `getRecent()` - Get recent notifications
  - `getByApp()` - Get notifications for specific app
- **Data Format**:
  ```typescript
  {
    title: string;
    message: string;
    app_name: string;
    icon?: string;
    is_read?: number;
    priority?: 'low' | 'normal' | 'high';
    action_url?: string;
  }
  ```

#### NoteModel
- **Purpose**: Manages notes with categories, pinning, and tagging
- **Key Methods**: 
  - `togglePin()` - Toggle pin status
  - `getPinned()` - Get pinned notes
  - `search()` - Search notes by title, content, or tags
  - `getByCategory()` - Filter by category
- **Data Format**:
  ```typescript
  {
    title: string;
    content: string;
    category?: string;
    is_pinned?: number;
    color?: string;
    tags?: string;
  }
  ```

#### CallLogModel
- **Purpose**: Manages call history with duration tracking
- **Key Methods**: 
  - `getMissedCallsCount()` - Get missed calls count
  - `getRecent()` - Get recent calls
  - `getByType()` - Filter by call type
  - `getByContact()` - Get calls for specific contact
- **Data Format**:
  ```typescript
  {
    contact_name: string;
    phone_number: string;
    call_type: 'incoming' | 'outgoing' | 'missed';
    duration?: number;
    timestamp?: number;
  }
  ```

#### AppUsageModel
- **Purpose**: Tracks application usage statistics
- **Key Methods**: 
  - `recordUsage()` - Record app usage time
  - `getTodayUsage()` - Get today's usage stats
  - `getUsageForDateRange()` - Get usage for date range
- **Data Format**:
  ```typescript
  {
    app_name: string;
    usage_time?: number;
    date?: string;
    open_count?: number;
  }
  ```

### Main ORM Class (`services/database/index.ts`)
- **DatabaseORM**: Main class that initializes all models
- Provides access to all model instances: `database.messages`, `database.contacts`, etc.
- Handles database initialization and default data insertion
- Utility methods for cross-model operations:
  - `getDashboardData()` - Get overview of all apps
  - `getNotificationBadges()` - Get notification counts for status bar
  - `clearAllData()` - Reset all data (for testing)

### Backward Compatibility (`services/database.ts`)
- **LegacyDatabaseService**: Maintains compatibility with existing code
- Maps new ORM methods to old interface
- Converts between new entity format and legacy interfaces
- Allows gradual migration without breaking existing code

## Usage Examples

### Using the New ORM
```typescript
import { database } from '@/services/database';

// Initialize database
await database.initialize();

// Create a new message
await database.messages.create({
  sender: 'John Doe',
  content: 'Hello!',
  message_type: 'text'
});

// Get unread messages
const unreadCount = await database.messages.getUnreadCount();

// Search contacts
const contacts = await database.contacts.search('john');

// Update settings
await database.settings.upsert('theme', 'dark');
```

### Using Legacy Interface (Backward Compatibility)
```typescript
import { databaseService } from '@/services/database';

// Works exactly like before
await databaseService.init();
await databaseService.addMessage('John', 'Hello!');
const messages = await databaseService.getMessages();
```

## Data Validation & Types
- Full TypeScript support with proper interfaces
- Automatic timestamp management (created_at, updated_at)
- Optional field handling with sensible defaults
- Type-safe query options and filtering

## Performance Features
- Database indexes for frequently queried fields
- Optimized queries for common operations
- Bulk operations support (e.g., markAsRead with multiple IDs)
- Efficient counting and aggregation methods

## Benefits
1. **Clean Architecture**: Separated concerns with dedicated model classes
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Maintainability**: Easy to add new models or modify existing ones
4. **Performance**: Optimized queries and proper indexing
5. **Flexibility**: Rich query options and filtering capabilities
6. **Backward Compatibility**: Existing code continues to work without changes
7. **Scalability**: Easy to extend with new features and relationships

## Migration Path
The ORM provides both new clean interfaces and legacy compatibility. You can:
1. Use existing code as-is with `databaseService`
2. Gradually migrate to new ORM with `database.models`
3. Mix both approaches during transition period
