import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  RefreshControl,
  Modal
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { typeORMDatabaseService } from '@/services/typeormDatabase';

// Simple interface for TypeScript compatibility
interface ContactInterface {
  id: number;
  name: string;
  phone: string;
  avatar?: string;
}

const ContactItem: React.FC<{ contact: ContactInterface; onPress: () => void }> = ({ contact, onPress }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <TouchableOpacity style={styles.contactItem} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactPhone}>{contact.phone}</Text>
      </View>
      <FontAwesome name="chevron-right" size={16} color="#ccc" />
    </TouchableOpacity>
  );
};

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<ContactInterface[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactInterface[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery]);

  const loadContacts = async () => {
    try {
      const contactList = await typeORMDatabaseService.getContacts();
      setContacts(contactList);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const handleContactPress = (contact: ContactInterface) => {
    Alert.alert(
      contact.name,
      contact.phone,
      [
        { text: 'Call', onPress: () => Alert.alert('Calling', `Calling ${contact.name}...`) },
        { text: 'Message', onPress: () => Alert.alert('Message', `Opening message to ${contact.name}...`) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const addContact = async () => {
    if (newContactName.trim() && newContactPhone.trim()) {
      try {
        await typeORMDatabaseService.addContact(newContactName.trim(), newContactPhone.trim());
        
        // Create notification for the new contact
        await typeORMDatabaseService.addNotification(
          'Contact Added',
          `${newContactName.trim()} has been added to your contacts`,
          'Contacts',
          'app'
        );
        
        setNewContactName('');
        setNewContactPhone('');
        setShowAddModal(false);
        loadContacts();
        Alert.alert('Success', 'Contact added successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to add contact');
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
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
        <Text style={styles.headerTitle}>Contacts</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <FontAwesome name="plus" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FontAwesome name="times-circle" size={16} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={({ item }) => (
          <ContactItem 
            contact={item} 
            onPress={() => handleContactPress(item)} 
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
      />

      {filteredContacts.length === 0 && !refreshing && (
        <View style={styles.emptyState}>
          <FontAwesome 
            name={searchQuery ? "search" : "user-plus"} 
            size={64} 
            color="#ccc" 
          />
          <Text style={styles.emptyStateText}>
            {searchQuery ? 'No matching contacts' : 'No contacts yet'}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {searchQuery ? 'Try a different search term' : 'Add your first contact!'}
          </Text>
        </View>
      )}

      {/* Add Contact Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Contact</Text>
            <TouchableOpacity onPress={addContact}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter name"
                value={newContactName}
                onChangeText={setNewContactName}
                autoFocus
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter phone number"
                value={newContactPhone}
                onChangeText={setNewContactPhone}
                keyboardType="phone-pad"
              />
            </View>
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
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    opacity: 0.6,
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
  inputGroup: {
    marginBottom: 20,
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
