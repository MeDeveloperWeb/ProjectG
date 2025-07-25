import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { databaseService } from '@/services/database';

const { width } = Dimensions.get('window');

interface AppIcon {
  name: string;
  icon: keyof typeof FontAwesome.glyphMap;
  color: string;
  route?: string;
  onPress?: () => void;
}

const AppIconComponent: React.FC<{ app: AppIcon }> = ({ app }) => {
  const handlePress = () => {
    if (app.onPress) {
      app.onPress();
    } else if (app.route) {
      router.push(app.route as any);
    }
  };

  return (
    <TouchableOpacity style={styles.appIcon} onPress={handlePress}>
      <View style={[styles.iconContainer, { backgroundColor: app.color }]}>
        <FontAwesome name={app.icon} size={32} color="white" />
      </View>
      <Text style={styles.appName}>{app.name}</Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [userName, setUserName] = useState('Player');

  const apps: AppIcon[] = [
    { 
      name: 'Messages', 
      icon: 'comment', 
      color: '#34C759', 
      onPress: () => router.push('/messages')
    },
    { 
      name: 'Contacts', 
      icon: 'user', 
      color: '#007AFF', 
      onPress: () => router.push('/contacts')
    },
    { 
      name: 'Calculator', 
      icon: 'calculator', 
      color: '#FF9500', 
      onPress: () => router.push('/calculator')
    },
    { 
      name: 'Camera', 
      icon: 'camera', 
      color: '#5856D6', 
      onPress: () => alert('Camera app coming soon!')
    },
    { 
      name: 'Gallery', 
      icon: 'photo', 
      color: '#FF2D92', 
      onPress: () => alert('Gallery app coming soon!')
    },
    { 
      name: 'Weather', 
      icon: 'cloud', 
      color: '#5AC8FA', 
      onPress: () => alert('Weather app coming soon!')
    },
    { 
      name: 'Clock', 
      icon: 'clock-o', 
      color: '#FF3B30', 
      onPress: () => alert('Clock app coming soon!')
    },
    { 
      name: 'Notes', 
      icon: 'sticky-note', 
      color: '#FFCC02', 
      onPress: () => router.push('/notes')
    },
    { 
      name: 'Music', 
      icon: 'music', 
      color: '#FF2D92', 
      onPress: () => alert('Music app coming soon!')
    },
    { 
      name: 'Games', 
      icon: 'gamepad', 
      color: '#30D158', 
      onPress: () => alert('Games app coming soon!')
    },
    { 
      name: 'Browser', 
      icon: 'globe', 
      color: '#007AFF', 
      onPress: () => alert('Browser app coming soon!')
    },
    { 
      name: 'Settings', 
      icon: 'cog', 
      color: '#8E8E93', 
      onPress: () => router.push('/settings')
    },
  ];

  useEffect(() => {
    // Initialize database and get user name
    const initializeApp = async () => {
      try {
        await databaseService.init();
        const name = await databaseService.getSetting('userName');
        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initializeApp();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Good {getTimeOfDay()}, {userName}!</Text>
        <Text style={styles.dateText}>{formatDate(new Date())}</Text>
      </View>

      {/* App Grid */}
      <ScrollView style={styles.appGrid} contentContainerStyle={styles.appGridContent}>
        <View style={styles.appsContainer}>
          {apps.map((app, index) => (
            <AppIconComponent key={index} app={app} />
          ))}
        </View>
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => alert('Phone app coming soon!')}
        >
          <FontAwesome name="phone" size={24} color="#34C759" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push('/messages')}
        >
          <FontAwesome name="comment" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => alert('Camera app coming soon!')}
        >
          <FontAwesome name="camera" size={24} color="#5856D6" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => alert('Music app coming soon!')}
        >
          <FontAwesome name="music" size={24} color="#FF2D92" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  welcomeSection: {
    padding: 20,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    opacity: 0.7,
  },
  appGrid: {
    flex: 1,
  },
  appGridContent: {
    padding: 20,
  },
  appsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  appIcon: {
    width: (width - 60) / 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appName: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  quickActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
