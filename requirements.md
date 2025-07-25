# Project Requirements: Mobile Phone Simulator

## 1. Project Overview

This document outlines the functional and technical requirements for a mobile phone simulator application. The application provides a complete, interactive mobile phone experience on a user's device, featuring a home screen, a custom status bar, and a suite of functional applications. The primary goal is to create a realistic and engaging simulated environment with persistent data and interactive elements.

---

## 2. Core Features

### 2.1. Phone Shell & UI
- **Full-Screen Experience**: The application shall operate in a full-screen, immersive mode, hiding the native device's status and navigation bars.
- **Custom Status Bar**: A custom, in-app status bar shall be displayed at the top of the screen. It must include:
    - **Real-time Clock**: Displays the current time.
    - **Notification Icons**: Shows icons for applications that have unread notifications.
    - **System Status**: Displays simulated network signal strength, Wi-Fi status, and battery level.
    - **Interactivity**: Tapping the status bar should open the Notifications Center.
- **Home Screen**: The main entry point of the simulator, displaying a grid of application icons.

### 2.2. Navigation System
- **App-Based Navigation**: Users navigate by tapping icons on the home screen to launch applications.
- **Back Navigation**: Every application screen must include a "back" button in its header to return to the previous screen or the home screen.
- **No Tab Bar**: The application will not use a bottom tab bar for navigation.

### 2.3. Data Persistence
- **Database**: All application data (messages, contacts, settings, etc.) must be stored persistently in a local database.
- **TypeORM Integration**: The project will use TypeORM as the Object-Relational Mapper (ORM) to interact with the SQLite database, ensuring type safety and maintainable data access.

---

## 3. Application Suite

The phone simulator will include the following functional applications:

### 3.1. Messages App
- **View Messages**: Display a list of all received messages, ordered by timestamp.
- **Unread Indicators**: Unread messages should be visually distinct.
- **Send Messages**: Users can compose and send new messages.
- **Simulated Replies**: After sending a message, the user will receive an automated, randomized reply from a contact.
- **Notifications**: Sending a reply will trigger a new message notification.
- **Mark as Read**: Opening a message thread or tapping on a message will mark it as read.

### 3.2. Contacts App
- **View Contacts**: Display a list of all saved contacts in alphabetical order.
- **Add Contacts**: Users can add new contacts with a name and phone number.
- **Notifications**: Adding a new contact will trigger a notification.

### 3.3. Settings App
- **User Profile**: Allows the user to view and change their username.
- **Theme Control**: A toggle to switch between light and dark themes for the entire application.
- **Notification Toggle**: Enable or disable all in-app notifications.
- **Sound Toggle**: A master switch for application sounds.
- **Reset to Default**: A button to reset all settings to their default values.

### 3.4. Calculator App
- **Basic Arithmetic**: A functional calculator that can perform addition, subtraction, multiplication, and division.
- **Standard Layout**: A familiar calculator interface with a display and buttons for numbers and operations.

### 3.5. Notes App
- **View Notes**: Display a list of all created notes.
- **Create & Edit Notes**: Users can create new notes and edit existing ones.
- **Data Persistence**: Notes must be saved to the database.

### 3.6. Notifications Center
- **View All Notifications**: A dedicated screen, accessible from the status bar, that lists all system and app notifications.
- **Clear Notifications**: A button to clear all notifications from the list.
- **Mark as Read**: Tapping a notification will mark it as read.

---

## 4. Technical Requirements

### 4.1. Frameworks and Libraries
- **Core**: React Native with Expo SDK.
- **Navigation**: Expo Router.
- **Database**: `react-native-sqlite-storage` with `TypeORM`.
- **UI Components**: Custom-built components using standard React Native elements.
- **Icons**: `@expo/vector-icons` (FontAwesome).
- **Metadata**: `reflect-metadata` for TypeORM decorator support.

### 4.2. Code and Project Structure
- **TypeScript**: The entire project must be written in TypeScript.
- **Component-Based Architecture**: The UI should be built with reusable components.
- **Service Layer**: Database interactions should be abstracted into a dedicated service layer.
- **Entity Definitions**: Database tables should be defined as TypeORM entities.
- **Clear Structure**: The project should maintain a clean and organized directory structure for components, screens, services, and entities.

### 4.3. Platform
- **Target Platform**: Android. The application must be fully functional and buildable for Android devices.
- **Development Environment**: The project should be runnable in a development client built with EAS Build.
