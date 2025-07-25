import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text, View } from '@/components/Themed';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export default function NotesModal() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSelectedNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
    setIsEditing(true);
  };

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  const saveNote = async () => {
    if (!selectedNote) return;

    const updatedNote: Note = {
      ...selectedNote,
      title: title.trim() || 'Untitled',
      content: content,
      updatedAt: Date.now(),
    };

    let updatedNotes;
    const existingIndex = notes.findIndex(n => n.id === selectedNote.id);
    
    if (existingIndex >= 0) {
      updatedNotes = [...notes];
      updatedNotes[existingIndex] = updatedNote;
    } else {
      updatedNotes = [updatedNote, ...notes];
    }

    await saveNotes(updatedNotes);
    setSelectedNote(updatedNote);
    setIsEditing(false);
  };

  const deleteNote = () => {
    if (!selectedNote) return;

    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedNotes = notes.filter(n => n.id !== selectedNote.id);
            await saveNotes(updatedNotes);
            setSelectedNote(null);
            setTitle('');
            setContent('');
            setIsEditing(false);
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <FontAwesome name="arrow-left" size={20} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notes</Text>
        <TouchableOpacity onPress={createNewNote} style={styles.newButton}>
          <FontAwesome name="plus" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Notes List */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {notes.map(note => (
              <TouchableOpacity
                key={note.id}
                style={[
                  styles.noteItem,
                  selectedNote?.id === note.id && styles.selectedNoteItem
                ]}
                onPress={() => selectNote(note)}
              >
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {note.title}
                </Text>
                <Text style={styles.notePreview} numberOfLines={2}>
                  {note.content || 'No additional text'}
                </Text>
                <Text style={styles.noteDate}>
                  {formatDate(note.updatedAt)}
                </Text>
              </TouchableOpacity>
            ))}
            {notes.length === 0 && (
              <View style={styles.emptyState}>
                <FontAwesome name="sticky-note-o" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No notes yet</Text>
                <Text style={styles.emptyStateSubtext}>Tap + to create your first note</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Note Editor */}
        <View style={styles.editor}>
          {selectedNote ? (
            <>
              <View style={styles.editorHeader}>
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Note title"
                  editable={isEditing}
                />
                <View style={styles.editorActions}>
                  {isEditing ? (
                    <TouchableOpacity onPress={saveNote} style={styles.actionButton}>
                      <FontAwesome name="save" size={20} color="#34C759" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.actionButton}>
                      <FontAwesome name="edit" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={deleteNote} style={styles.actionButton}>
                    <FontAwesome name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <TextInput
                style={styles.contentInput}
                value={content}
                onChangeText={setContent}
                placeholder="Start writing..."
                multiline
                editable={isEditing}
                textAlignVertical="top"
              />
              
              <Text style={styles.wordCount}>
                {content.length} characters
              </Text>
            </>
          ) : (
            <View style={styles.noSelection}>
              <FontAwesome name="sticky-note-o" size={64} color="#ccc" />
              <Text style={styles.noSelectionText}>Select a note to view</Text>
              <Text style={styles.noSelectionSubtext}>Or create a new one</Text>
            </View>
          )}
        </View>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 16, // Reduced since global status bar is now present
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  newButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  noteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  selectedNoteItem: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
    lineHeight: 18,
  },
  noteDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  editor: {
    flex: 1,
    padding: 20,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  editorActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  wordCount: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'right',
    marginTop: 8,
  },
  noSelection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSelectionText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noSelectionSubtext: {
    fontSize: 16,
    opacity: 0.6,
  },
});
