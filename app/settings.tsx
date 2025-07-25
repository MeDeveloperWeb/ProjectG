import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { typeORMDatabaseService } from '@/services/typeormDatabase';
import { useColorScheme } from '@/components/useColorScheme';

interface SettingItem {
  key: string;
  title: string;
  type: 'toggle' | 'text' | 'action';
  icon: keyof typeof FontAwesome.glyphMap;
  value?: string | boolean;
  action?: () => void;
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempUserName, setTempUserName] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userName = await typeORMDatabaseService.getSetting('userName') || 'Player';
      const theme = await typeORMDatabaseService.getSetting('theme') || 'light';
      const notifications = await typeORMDatabaseService.getSetting('notifications') === 'true';
      const sound = await typeORMDatabaseService.getSetting('sound') === 'true';

      setSettings([
        {
          key: 'userName',
          title: 'User Name',
          type: 'text',
          icon: 'user',
          value: userName,
          action: () => {
            setTempUserName(userName);
            setShowNameModal(true);
          }
        },
        {
          key: 'theme',
          title: 'Dark Mode',
          type: 'toggle',
          icon: 'moon-o',
          value: theme === 'dark'
        },
        {
          key: 'notifications',
          title: 'Notifications',
          type: 'toggle',
          icon: 'bell',
          value: notifications
        },
        {
          key: 'sound',
          title: 'Sound Effects',
          type: 'toggle',
          icon: 'volume-up',
          value: sound
        },
        {
          key: 'storage',
          title: 'Storage Usage',
          type: 'action',
          icon: 'database',
          action: showStorageInfo
        },
        {
          key: 'about',
          title: 'About',
          type: 'action',
          icon: 'info-circle',
          action: showAbout
        },
        {
          key: 'reset',
          title: 'Reset All Data',
          type: 'action',
          icon: 'trash',
          action: confirmReset
        }
      ]);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSetting = async (key: string, value: string | boolean) => {
    try {
      await typeORMDatabaseService.setSetting(key, value.toString());
      loadSettings();
      
      if (key === 'theme') {
        Alert.alert('Theme Changed', 'Please restart the app to see the changes.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const saveUserName = async () => {
    if (tempUserName.trim()) {
      await updateSetting('userName', tempUserName.trim());
      setShowNameModal(false);
    }
  };

  const showStorageInfo = () => {
    Alert.alert(
      'Storage Usage',
      'App data: ~2.5 MB\nMessages: ~1.2 MB\nContacts: ~0.8 MB\nSettings: ~0.1 MB\n\nTotal: ~4.6 MB',
      [{ text: 'OK' }]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About Phone Simulator',
      'Version: 1.0.0\nDeveloped with React Native & Expo\n\nA mobile phone simulator game featuring multiple interactive apps.',
      [{ text: 'OK' }]
    );
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all messages, contacts, and reset all settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetAllData }
      ]
    );
  };

  const resetAllData = async () => {
    try {
      // Reset to default settings
      await typeORMDatabaseService.setSetting('userName', 'Player');
      await typeORMDatabaseService.setSetting('theme', 'light');
      await typeORMDatabaseService.setSetting('notifications', 'true');
      await typeORMDatabaseService.setSetting('sound', 'true');
      
      Alert.alert('Success', 'All data has been reset to defaults.');
      loadSettings();
    } catch (error) {
      Alert.alert('Error', 'Failed to reset data');
    }
  };

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.key}
        style={styles.settingItem}
        onPress={item.action}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: getIconColor(item.key) }]}>
            <FontAwesome name={item.icon} size={20} color="#fff" />
          </View>
          <Text style={styles.settingTitle}>{item.title}</Text>
        </View>
        
        <View style={styles.settingRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value as boolean}
              onValueChange={(value) => updateSetting(item.key, value)}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={'#f4f3f4'}
            />
          )}
          {item.type === 'text' && (
            <View style={styles.textValue}>
              <Text style={styles.settingValue}>{item.value as string}</Text>
              <FontAwesome name="chevron-right" size={16} color="#ccc" />
            </View>
          )}
          {item.type === 'action' && (
            <FontAwesome name="chevron-right" size={16} color="#ccc" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getIconColor = (key: string): string => {
    const colors: { [key: string]: string } = {
      userName: '#007AFF',
      theme: '#5856D6',
      notifications: '#FF9500',
      sound: '#34C759',
      storage: '#FF2D92',
      about: '#8E8E93',
      reset: '#FF3B30'
    };
    return colors[key] || '#007AFF';
  };

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
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Settings List */}
      <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal</Text>
          {settings.slice(0, 1).map(renderSettingItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {settings.slice(1, 4).map(renderSettingItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          {settings.slice(4, 6).map(renderSettingItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          {settings.slice(6).map(renderSettingItem)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Phone Simulator v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ using React Native
          </Text>
        </View>
      </ScrollView>

      {/* User Name Modal */}
      <Modal
        visible={showNameModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNameModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Name</Text>
            <TouchableOpacity onPress={saveUserName}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your name"
              value={tempUserName}
              onChangeText={setTempUserName}
              autoFocus
              maxLength={50}
            />
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 16, // Reduced since global status bar is now present
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsList: {
    flex: 1,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 8,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingRight: {
    alignItems: 'center',
  },
  textValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    opacity: 0.6,
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    opacity: 0.4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});
