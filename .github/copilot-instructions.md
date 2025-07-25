# AI Development Instructions for ProjectG

## Project Overview
This is a **React Native + Expo mobile game** that simulates a phone interface with multiple interactive in-game apps. Each app follows a common UI/UX pattern and shares data through SQLite persistence. Think of it as a "phone within a game" where users interact with various mini-applications.

## Architecture & Routing
- **Expo Router v5** with typed routes enabled - uses file-based routing in `app/` directory
- **Navigation Structure**: `app/_layout.tsx` (root) → `app/(tabs)/_layout.tsx` (tab navigation) → individual screens
- **Modal Support**: Modal screens are defined at root level (e.g., `app/modal.tsx`) with `presentation: 'modal'`
- **Cross-Platform**: Supports iOS, Android, and web with platform-specific adjustments using `.web.ts` extensions

## Key Conventions

### Component Patterns
- **Themed Components**: Always use `@/components/Themed` exports (`Text`, `View`) instead of React Native defaults
- **Color System**: Colors defined in `@/constants/Colors.ts` with automatic light/dark mode support
- **Platform Detection**: Use `useClientOnlyValue()` for web-specific behavior (especially navigation headers)

### File Organization
```
app/                    # Expo Router pages (file-based routing)
  (tabs)/              # Tab navigation group
  _layout.tsx          # Root layout with navigation setup
components/            # Reusable UI components with theming
constants/             # Colors, app-wide constants
assets/               # Images, fonts, static resources
```

### Path Aliases
- Use `@/` prefix for imports: `@/components/Themed`, `@/constants/Colors`
- Configured in `tsconfig.json` for clean import paths

## Development Workflow

### Essential Commands
```bash
# Development
npm start              # Start Expo dev server
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Web browser

# Building
npx eas build --platform all    # Production builds via EAS
```

### Database Integration (Planned)
- **SQLite via expo-sqlite**: For persistent data across in-game apps
- Data should be shared between different phone "apps" (messages, settings, etc.)
- Consider creating a centralized data service for cross-app state management

## Mobile Phone Simulator Specific Patterns

### UI/UX Consistency
- Each in-game "app" should feel like a real mobile app
- Use `@expo/vector-icons` for app icons and UI elements
- Maintain consistent spacing and styling across all mini-apps
- Consider implementing a phone-like status bar and home screen

### App Structure (for new in-game apps)
1. Create new tab or modal route in `app/` directory
2. Use themed components for automatic dark/light mode support
3. Implement app-specific data persistence via SQLite
4. Follow the existing pattern in `app/(tabs)/index.tsx` for consistency

## Technical Notes
- **Expo SDK ~53**: Latest features enabled including new architecture
- **TypeScript**: Strict mode enabled with full type checking
- **EAS Integration**: Project ID `1bf357e0-3e06-4c1e-acee-104cf373673c` configured
- **Testing**: Jest with expo preset configured

## Code Style
- Use functional components with hooks
- Prefer `nativewind` for styles
- Platform-specific code goes in `.web.ts/.ts` file pairs
- Always handle both light and dark themes in UI components

When adding new features, focus on the "phone simulation" aspect - each feature should feel like a distinct app within the simulated phone interface.
