import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { typeORMDatabaseService } from '@/services/typeormDatabase';

// Simple interface for TypeScript compatibility
interface NotificationInterface {
  id: number;
  title: string;
  body: string;
  appName: string;
  timestamp: number;
  type: 'message' | 'system' | 'app';
  isRead: boolean;
}

const NotificationItem: React.FC<{ 
  notification: NotificationInterface; 
  onPress: () => void;
  onMarkAsRead: () => void;
}> = ({ notification, onPress, onMarkAsRead }) => {
  const getIconName = (type: string): keyof typeof FontAwesome.glyphMap => {
    switch (type) {
      case 'message': return 'comment';
      case 'system': return 'cog';
      case 'app': return 'mobile';
      default: return 'bell';
    }
  };

  const getIconColor = (type: string): string => {
    switch (type) {
      case 'message': return '#34C759';
      case 'system': return '#007AFF';
      case 'app': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        !notification.isRead && styles.unreadNotification
      ]} 
      onPress={onPress}
    >
      <View style={styles.notificationHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getIconColor(notification.type) }]}>
          <FontAwesome name={getIconName(notification.type)} size={16} color="#fff" />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationTop}>
            <Text style={styles.appName}>{notification.appName}</Text>
            <Text style={styles.timestamp}>{formatTime(notification.timestamp)}</Text>
          </View>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>
        {!notification.isRead && (
          <TouchableOpacity onPress={onMarkAsRead} style={styles.markAsReadButton}>
            <FontAwesome name="circle" size={8} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationInterface[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await typeORMDatabaseService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: NotificationInterface) => {
    // Mark as read when pressed
    if (!notification.isRead) {
      await typeORMDatabaseService.markNotificationAsRead(notification.id);
      loadNotifications();
    }

    // Navigate to related app if available
    switch (notification.appName.toLowerCase()) {
      case 'messages':
        router.push('/messages');
        break;
      case 'contacts':
        router.push('/contacts');
        break;
      case 'settings':
        router.push('/settings');
        break;
      default:
        // Show notification details
        Alert.alert(notification.title, notification.body);
        break;
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await typeORMDatabaseService.markNotificationAsRead(id);
      loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await typeORMDatabaseService.clearAllNotifications();
              loadNotifications();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications');
            }
          }
        }
      ]
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearAllNotifications}
          >
            <FontAwesome name="trash" size={18} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {/* Unread count */}
      {unreadCount > 0 && (
        <View style={styles.unreadSection}>
          <Text style={styles.unreadText}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <NotificationItem 
              notification={item} 
              onPress={() => handleNotificationPress(item)}
              onMarkAsRead={() => markAsRead(item.id)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.notificationsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="bell-slash" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No Notifications</Text>
          <Text style={styles.emptyStateSubtext}>
            You're all caught up! Notifications will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 16, // Reduced since global status bar is now present
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    padding: 8,
  },
  unreadSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  unreadText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(0, 122, 255, 0.02)',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  markAsReadButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
