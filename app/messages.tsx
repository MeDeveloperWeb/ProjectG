import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  RefreshControl 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { typeORMDatabaseService } from '@/services/typeormDatabase';

// Simple interface for TypeScript compatibility
interface MessageInterface {
  id: number;
  sender: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

const MessageItem: React.FC<{ message: MessageInterface; onPress: () => void }> = ({ message, onPress }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <TouchableOpacity style={styles.messageItem} onPress={onPress}>
      <View style={styles.messageHeader}>
        <View style={styles.avatar}>
          <FontAwesome name="user" size={20} color="#fff" />
        </View>
        <View style={styles.messageContent}>
          <View style={styles.messageTop}>
            <Text style={styles.senderName}>{message.sender}</Text>
            <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
          </View>
          <Text style={[styles.messageText, !message.isRead && styles.unreadMessage]}>
            {message.content}
          </Text>
        </View>
        {!message.isRead && <View style={styles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  );
};

export default function MessagesScreen() {
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const messageList = await typeORMDatabaseService.getMessages();
      setMessages(messageList);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handleMessagePress = async (message: MessageInterface) => {
    if (!message.isRead) {
      await typeORMDatabaseService.markMessageAsRead(message.id);
      loadMessages();
    }
    
    Alert.alert(
      message.sender,
      message.content,
      [
        { text: 'Reply', onPress: () => setShowCompose(true) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const sendMessage = async () => {
    if (newMessage.trim()) {
      await typeORMDatabaseService.addMessage('You', newMessage.trim());
      setNewMessage('');
      setShowCompose(false);
      loadMessages();
      
      // Simulate a response after 2 seconds
      setTimeout(async () => {
        const responses = [
          'Thanks for your message!',
          'Got it, will get back to you soon.',
          'Sounds good! 👍',
          'Let me think about that.',
          'Sure thing!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const sender = 'Alice Johnson';
        await typeORMDatabaseService.addMessage(sender, randomResponse);
        
        // Create notification for the new message
        await typeORMDatabaseService.addNotification(
          'New Message',
          `${sender}: ${randomResponse}`,
          'Messages',
          'message'
        );
        
        loadMessages();
      }, 2000);
    }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

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
        <Text style={styles.headerTitle}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.composeButton}
          onPress={() => setShowCompose(!showCompose)}
        >
          <FontAwesome name={showCompose ? "times" : "edit"} size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Compose Message */}
      {showCompose && (
        <View style={styles.composeSection}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <FontAwesome name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageItem 
            message={item} 
            onPress={() => handleMessagePress(item)} 
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {messages.length === 0 && (
        <View style={styles.emptyState}>
          <FontAwesome name="comment-o" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No messages yet</Text>
          <Text style={styles.emptyStateSubtext}>Start a conversation!</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 16, // Reduced since global status bar is now present
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  composeButton: {
    padding: 8,
  },
  composeSection: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  messageText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  unreadMessage: {
    opacity: 1,
    fontWeight: '500',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 8,
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
    opacity: 0.6,
    textAlign: 'center',
  },
});
