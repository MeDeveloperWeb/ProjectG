# ProjectG - Mobile Phone Simulator Game

A React Native + Expo mobile game that simulates a complete phone interface with multiple interactive in-game apps. This project creates a "phone within a game" experience where users can interact with various mini-applications.

## 🎮 Game Concept

This application simulates a mobile phone OS with functional apps that provide an immersive experience. Users can:
- Send and receive messages
- Manage contacts
- Use a calculator
- Take notes
- Customize settings
- And much more!

## 🚀 Features

### Core Phone Apps
- **Home Screen**: App launcher with icon grid and quick actions
- **Messages**: Send/receive messages with simulated responses
- **Contacts**: Manage contact list with add/edit functionality
- **Calculator**: Fully functional calculator with standard operations
- **Notes**: Create, edit, and manage notes with rich text support
- **Settings**: Customize app preferences and user profile

### Technical Features
- **SQLite Database**: Persistent data storage across all apps
- **Dark/Light Mode**: Automatic theme switching
- **Cross-Platform**: Runs on iOS, Android, and Web
- **Responsive Design**: Adapts to different screen sizes
- **TypeScript**: Full type safety and IntelliSense support

## 📱 Architecture

### Expo Router v5
- File-based routing in `app/` directory
- Tab navigation for main apps
- Modal screens for utilities (Calculator, Notes)
- Typed routes for better development experience

### Data Persistence
- **SQLite (expo-sqlite)**: Main database for app data
- **AsyncStorage**: Simple key-value storage for notes
- Shared data across different phone "apps"

### Component Structure
```
app/
├── _layout.tsx          # Root navigation layout
├── (tabs)/             # Tab-based main apps
│   ├── _layout.tsx     # Tab navigation
│   ├── index.tsx       # Home screen
│   ├── messages.tsx    # Messages app
│   ├── contacts.tsx    # Contacts app
│   └── settings.tsx    # Settings app
├── calculator.tsx      # Calculator modal
└── notes.tsx          # Notes modal

components/
├── Themed.tsx          # Themed UI components
└── ...                # Other reusable components

services/
└── database.ts         # SQLite database service
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (16 or later)
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator (optional)

### Installation

1. **Clone and setup**:
   ```bash
   cd ProjectG
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Run on platforms**:
   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator  
   npm run web      # Web Browser
   ```

### Development Commands

```bash
# Development
npm start                    # Start Expo dev server with QR code
npm run ios                 # Run on iOS simulator
npm run android             # Run on Android emulator
npm run web                 # Run in web browser

# Building
npx eas build --platform all   # Build for production (requires EAS)

# Testing
npm test                    # Run Jest tests
```

## 📋 App Features

### Messages App
- View conversation list with unread indicators
- Send and receive messages
- Simulated responses from contacts
- Mark messages as read
- Pull-to-refresh functionality

### Contacts App
- Browse contact list with search
- Add new contacts with name and phone
- Contact details with call/message actions
- Alphabetical sorting

### Calculator App
- Standard arithmetic operations (+, -, ×, ÷)
- Decimal point support
- Clear and sign change functions
- Percentage calculations
- iOS-style interface

### Notes App
- Create and edit rich text notes
- Sidebar navigation between notes
- Auto-save functionality
- Character count
- Search and filter notes

### Settings App
- User profile customization
- Theme switching (Light/Dark)
- Notification preferences
- Sound settings
- Storage usage information
- Reset functionality

## 🎨 Design Philosophy

### Phone-like Experience
- Each app feels like a real mobile application
- Consistent design language across all apps
- Proper navigation patterns and gestures
- Status bar simulation
- App icons with realistic styling

### User Interface
- **Themed Components**: Automatic light/dark mode support
- **Vector Icons**: `@expo/vector-icons` for consistent iconography
- **Responsive Layout**: Adapts to different screen sizes
- **Smooth Animations**: React Native Reanimated for fluid transitions

## 🔧 Technical Details

### Database Schema
```sql
-- Messages
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  isRead INTEGER DEFAULT 0
);

-- Contacts
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar TEXT
);

-- Settings
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

-- App Usage
CREATE TABLE app_usage (
  id INTEGER PRIMARY KEY,
  appName TEXT NOT NULL,
  usageTime INTEGER DEFAULT 0,
  lastUsed INTEGER NOT NULL
);
```

### Dependencies
- **expo**: ~53.0.17 - Expo SDK
- **react-native**: 0.79.5 - React Native framework
- **expo-router**: ~5.1.3 - File-based routing
- **expo-sqlite**: SQLite database
- **@expo/vector-icons**: Icon library
- **react-native-reanimated**: Animations
- **@react-native-async-storage/async-storage**: Simple storage

## 🚧 Future Enhancements

### Planned Apps
- **Phone**: Call simulation with contact integration
- **Camera**: Photo capture and gallery
- **Gallery**: Image viewer and management
- **Weather**: Location-based weather information
- **Clock**: Alarms, timers, and world clock
- **Music**: Audio player with playlist support
- **Games**: Mini-games collection
- **Browser**: Simple web browser

### Features
- Push notifications simulation
- App usage analytics
- Custom wallpapers
- Widget support
- Voice memos
- Calendar integration

## 📄 License

This project is for educational and demonstration purposes. Feel free to use it as a reference for building similar applications.

## 🤝 Contributing

This is a learning project, but contributions and suggestions are welcome! Please feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share feedback

## 📞 Support

For questions or support, please check the project documentation or create an issue in the repository.

---

**ProjectG** - Bringing the mobile phone experience to life through React Native! 📱✨
