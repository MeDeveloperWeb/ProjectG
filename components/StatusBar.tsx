import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
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

interface AppNotification {
  appName: string;
  count: number;
  icon: keyof typeof FontAwesome.glyphMap;
  color: string;
}

export const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(75);
  const [signalStrength, setSignalStrength] = useState(4);
  const [wifiConnected, setWifiConnected] = useState(true);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Update notifications count every 10 seconds
    const notificationTimer = setInterval(async () => {
      try {
        // Ensure database is initialized before calling methods
        await typeORMDatabaseService.init();
        const unreadCount = await typeORMDatabaseService.getUnreadNotificationsCount();
        setUnreadNotifications(unreadCount);
        
        // Get notifications grouped by app
        const notifications = await typeORMDatabaseService.getNotifications();
        const unreadNotifications = notifications.filter((n: NotificationInterface) => !n.isRead);
        
        const appGroups = unreadNotifications.reduce((acc: Record<string, number>, notification: NotificationInterface) => {
          if (!acc[notification.appName]) {
            acc[notification.appName] = 0;
          }
          acc[notification.appName]++;
          return acc;
        }, {} as Record<string, number>);

        const appNotifs: AppNotification[] = Object.entries(appGroups).map(([appName, count]) => {
          let icon: keyof typeof FontAwesome.glyphMap = 'bell';
          let color = '#007AFF';
          
          switch (appName.toLowerCase()) {
            case 'messages':
              icon = 'comment';
              color = '#34C759';
              break;
            case 'contacts':
              icon = 'user';
              color = '#007AFF';
              break;
            case 'system':
              icon = 'cog';
              color = '#8E8E93';
              break;
            default:
              icon = 'bell';
              color = '#FF9500';
              break;
          }
          
          return { appName, count, icon, color };
        });

        setAppNotifications(appNotifs);
      } catch (error) {
        console.error('Failed to update notification count:', error);
      }
    }, 10000);

    // Simulate battery and network changes
    const systemTimer = setInterval(() => {
      // Simulate battery drain
      setBatteryLevel(prev => {
        const newLevel = prev - Math.random() * 2;
        return Math.max(20, newLevel);
      });
      
      // Simulate signal fluctuation
      setSignalStrength(prev => {
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(1, Math.min(4, prev + change));
      });
      
      // Occasionally toggle WiFi
      if (Math.random() > 0.95) {
        setWifiConnected(prev => !prev);
      }
    }, 30000);

    // Initial load
    const loadInitialData = async () => {
      try {
        // Ensure database is initialized before calling methods
        await typeORMDatabaseService.init();
        const unreadCount = await typeORMDatabaseService.getUnreadNotificationsCount();
        setUnreadNotifications(unreadCount);
      } catch (error) {
        console.error('Failed to load initial notification count:', error);
      }
    };

    loadInitialData();

    return () => {
      clearInterval(timer);
      clearInterval(notificationTimer);
      clearInterval(systemTimer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBatteryIcon = (): keyof typeof FontAwesome.glyphMap => {
    if (batteryLevel > 75) return 'battery-full';
    if (batteryLevel > 50) return 'battery-three-quarters';
    if (batteryLevel > 25) return 'battery-half';
    if (batteryLevel > 10) return 'battery-quarter';
    return 'battery-empty';
  };

  const getBatteryColor = (): string => {
    if (batteryLevel <= 20) return '#FF3B30';
    if (batteryLevel <= 30) return '#FF9500';
    return '#34C759';
  };

  const getSignalIcon = (): keyof typeof FontAwesome.glyphMap => {
    return 'signal';
  };

  const handleNotificationBarPress = () => {
    router.push('/notifications');
  };

  const handleAppNotificationPress = (appName: string) => {
    switch (appName.toLowerCase()) {
      case 'messages':
        router.push('/messages');
        break;
      case 'contacts':
        router.push('/contacts');
        break;
      case 'system':
        router.push('/settings');
        break;
      default:
        router.push('/notifications');
        break;
    }
  };

  return (
    <TouchableOpacity style={styles.statusBar} onPress={handleNotificationBarPress}>
      {/* Left Side: Time + App Notification Icons */}
      <View style={styles.leftSection}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        
        {/* App Notification Icons */}
        <View style={styles.appNotifications}>
          {appNotifications.slice(0, 3).map((appNotif, index) => (
            <TouchableOpacity
              key={appNotif.appName}
              style={styles.appNotificationIcon}
              onPress={() => handleAppNotificationPress(appNotif.appName)}
            >
              <FontAwesome 
                name={appNotif.icon} 
                size={12} 
                color={appNotif.color} 
              />
              {appNotif.count > 1 && (
                <View style={styles.appNotificationBadge}>
                  <Text style={styles.appNotificationBadgeText}>
                    {appNotif.count > 9 ? '9+' : appNotif.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          {/* Show general notification badge if there are more apps or total notifications */}
          {(appNotifications.length > 3 || unreadNotifications > 0) && (
            <View style={styles.generalNotificationBadge}>
              <Text style={styles.generalNotificationBadgeText}>
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right Side: Network, WiFi, Battery */}
      <View style={styles.rightSection}>
        <View style={styles.systemIcons}>
          {/* Signal Strength */}
          <View style={styles.signalContainer}>
            <FontAwesome 
              name={getSignalIcon()} 
              size={14} 
              color="#fff" 
              style={[styles.systemIcon, { opacity: signalStrength * 0.25 }]} 
            />
            <View style={styles.signalBars}>
              {[1, 2, 3, 4].map((bar) => (
                <View
                  key={bar}
                  style={[
                    styles.signalBar,
                    { 
                      opacity: bar <= signalStrength ? 1 : 0.3,
                      height: bar * 2 + 2
                    }
                  ]}
                />
              ))}
            </View>
          </View>
          
          {/* WiFi */}
          <FontAwesome 
            name="wifi" 
            size={14} 
            color={wifiConnected ? '#fff' : '#666'} 
            style={styles.systemIcon} 
          />
          
          {/* Battery */}
          <View style={styles.batteryContainer}>
            <FontAwesome 
              name={getBatteryIcon()} 
              size={14} 
              color={getBatteryColor()} 
              style={styles.systemIcon} 
            />
            <Text style={[styles.batteryText, { color: getBatteryColor() }]}>
              {Math.round(batteryLevel)}%
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 20, // Reduced padding for full screen
    backgroundColor: 'rgba(0,0,0,0.9)', // Darker, more realistic status bar
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    color: '#fff', // White text for dark status bar
  },
  appNotifications: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appNotificationIcon: {
    marginRight: 8,
    position: 'relative',
  },
  appNotificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appNotificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  generalNotificationBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  generalNotificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  systemIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  systemIcon: {
    marginLeft: 8,
    opacity: 0.8,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: 4,
  },
  signalBar: {
    width: 2,
    backgroundColor: '#fff',
    marginRight: 1,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  // Legacy styles to maintain compatibility
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusIcon: {
    marginLeft: 12,
    opacity: 0.8,
  },
});
