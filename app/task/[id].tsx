import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/store/app-store';

type Priority = 'low' | 'medium' | 'high';

export default function TaskDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const isCreateMode = params.id === 'new';

  const tasks = useAppStore((state) => state.tasks);
  const friends = useAppStore((state) => state.friends);
  const addTask = useAppStore((state) => state.addTask);
  const updateTask = useAppStore((state) => state.updateTask);

  const selectedTask = useMemo(
    () => (isCreateMode ? undefined : tasks.find((task) => task.id === params.id)),
    [isCreateMode, params.id, tasks]
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setCompleted(selectedTask.completed);
      setSharedWith(selectedTask.sharedWith);
      setDescription('');
      return;
    }

    if (isCreateMode) {
      setTitle('');
      setCompleted(false);
      setSharedWith([]);
      setDescription('');
      setPriority('medium');
    }
  }, [isCreateMode, selectedTask]);

  const toggleFriend = (friendId: string) => {
    setSharedWith((current) =>
      current.includes(friendId) ? current.filter((id) => id !== friendId) : [...current, friendId]
    );
  };

  const toggleSelectAllFriends = () => {
    if (friends.length === 0) {
      return;
    }
    if (sharedWith.length === friends.length) {
      setSharedWith([]);
      return;
    }
    setSharedWith(friends.map((friend) => friend.id));
  };

  const handleSave = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      return;
    }

    setIsSaving(true);
    try {
      if (isCreateMode) {
        await addTask({
          title: cleanTitle,
          completed,
          sharedWith,
          attachmentUri: description.trim() || undefined,
        });
      } else if (selectedTask) {
        await updateTask(selectedTask.id, {
          title: cleanTitle,
          completed,
          sharedWith,
          attachmentUri: description.trim() || undefined,
        });
      }
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isCreateMode && !selectedTask) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Task not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.pageTitle}>{isCreateMode ? 'New Task' : 'Edit Task'}</Text>
          <Pressable onPress={handleSave} disabled={!title.trim() || isSaving}>
            <Text style={[styles.doneText, (!title.trim() || isSaving) && styles.doneTextDisabled]}>
              {isSaving ? 'Saving' : 'Done'}
            </Text>
          </Pressable>
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Task Title"
          placeholderTextColor="#334968"
          style={styles.titleInput}
          autoCapitalize="sentences"
        />

        <View style={styles.descriptionRow}>
          <Ionicons name="reorder-three-outline" size={34} color="#90a4be" />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add description..."
            placeholderTextColor="#6f839a"
            style={styles.descriptionInput}
            autoCapitalize="sentences"
          />
        </View>

        <Pressable onPress={() => setCompleted((prev) => !prev)} style={styles.completedRow}>
          <View style={[styles.completedCircle, completed && styles.completedCircleActive]}>
            {completed ? <Ionicons name="checkmark" size={15} color="#031723" /> : null}
          </View>
          <Text style={styles.completedLabel}>Mark as completed</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>DUE DATE</Text>
        <Pressable style={styles.dueDateCard}>
          <Ionicons name="calendar-outline" size={33} color="#19c9ec" />
          <Text style={styles.dueDateText}>Tomorrow, Oct 24</Text>
          <Ionicons name="chevron-forward" size={30} color="#6381a3" />
        </Pressable>

        <Text style={styles.sectionTitle}>PRIORITY</Text>
        <View style={styles.priorityRow}>
          {(['low', 'medium', 'high'] as Priority[]).map((item) => {
            const active = priority === item;
            return (
              <Pressable
                key={item}
                onPress={() => setPriority(item)}
                style={[styles.priorityChip, active && styles.priorityChipActive]}>
                <Text style={[styles.priorityChipText, active && styles.priorityChipTextActive]}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.shareHeader}>
          <Text style={styles.sectionTitle}>SHARE WITH</Text>
          <Pressable onPress={toggleSelectAllFriends}>
            <Text style={styles.selectAllText}>Select All</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsList}>
          {friends.map((friend) => {
            const selected = sharedWith.includes(friend.id);
            const initial = friend.name.slice(0, 1).toUpperCase();
            return (
              <Pressable key={friend.id} onPress={() => toggleFriend(friend.id)} style={styles.friendItem}>
                <View style={[styles.friendAvatar, selected && styles.friendAvatarSelected]}>
                  <Text style={styles.friendAvatarLabel}>{initial}</Text>
                  {selected ? (
                    <View style={styles.friendCheck}>
                      <Ionicons name="checkmark" size={18} color="#032033" />
                    </View>
                  ) : null}
                </View>
                <Text style={styles.friendName} numberOfLines={1}>
                  {friend.name}
                </Text>
              </Pressable>
            );
          })}
          {friends.length === 0 ? <Text style={styles.emptyFriends}>Add friends first from Friends tab.</Text> : null}
        </ScrollView>

        <View style={styles.attachRow}>
          <Pressable style={styles.attachButtonWide}>
            <Ionicons name="camera-outline" size={31} color="#cbd5e1" />
            <Text style={styles.attachButtonLabel}>Attach Photo</Text>
          </Pressable>
          <Pressable style={styles.attachButtonSmall}>
            <Ionicons name="attach-outline" size={31} color="#cbd5e1" />
          </Pressable>
        </View>
      </ScrollView>

      <Pressable
        onPress={handleSave}
        disabled={!title.trim() || isSaving}
        style={({ pressed }) => [
          styles.createButton,
          (!title.trim() || isSaving) && styles.createButtonDisabled,
          pressed && styles.createButtonPressed,
        ]}>
        <Text style={styles.createButtonLabel}>{isSaving ? 'Saving...' : isCreateMode ? 'Create Task' : 'Save Task'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#031d29',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#031d29',
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 130,
    gap: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelText: {
    color: '#91a3b8',
    fontSize: 18,
    fontWeight: '500',
  },
  pageTitle: {
    color: '#ecf2fa',
    fontSize: 22,
    fontWeight: '700',
  },
  doneText: {
    color: '#1ec7eb',
    fontSize: 18,
    fontWeight: '700',
  },
  doneTextDisabled: {
    opacity: 0.45,
  },
  titleInput: {
    marginTop: 8,
    color: '#ecf2fa',
    fontSize: 52,
    fontWeight: '700',
    paddingVertical: 2,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  descriptionInput: {
    flex: 1,
    color: '#ecf2fa',
    fontSize: 18,
    paddingVertical: 4,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  completedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.6,
    borderColor: '#2f5974',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCircleActive: {
    borderColor: '#1ec7eb',
    backgroundColor: '#1ec7eb',
  },
  completedLabel: {
    color: '#9cb0c4',
    fontSize: 16,
  },
  sectionTitle: {
    color: '#738aa4',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  dueDateCard: {
    minHeight: 100,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#25445e',
    backgroundColor: '#11273b',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dueDateText: {
    flex: 1,
    color: '#e5edf6',
    fontSize: 39,
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityChip: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#244660',
    backgroundColor: '#11273b',
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityChipActive: {
    borderColor: '#1ec7eb',
    backgroundColor: '#114452',
  },
  priorityChipText: {
    color: '#8fa3b9',
    fontSize: 24,
    fontWeight: '700',
  },
  priorityChipTextActive: {
    color: '#1ec7eb',
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectAllText: {
    color: '#1ec7eb',
    fontSize: 18,
    fontWeight: '600',
  },
  friendsList: {
    gap: 12,
    paddingRight: 12,
  },
  friendItem: {
    width: 84,
    alignItems: 'center',
    gap: 8,
  },
  friendAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarSelected: {
    borderColor: '#1ec7eb',
  },
  friendAvatarLabel: {
    color: '#1f2937',
    fontSize: 28,
    fontWeight: '700',
  },
  friendCheck: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#031d29',
    backgroundColor: '#1ec7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendName: {
    color: '#d5deea',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyFriends: {
    color: '#7f95ad',
    fontSize: 14,
    marginTop: 14,
  },
  attachRow: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 10,
  },
  attachButtonWide: {
    flex: 1,
    minHeight: 78,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#244660',
    backgroundColor: '#11273b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  attachButtonSmall: {
    width: 86,
    minHeight: 78,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#244660',
    backgroundColor: '#11273b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButtonLabel: {
    color: '#d5deea',
    fontSize: 20,
    fontWeight: '600',
  },
  createButton: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 22,
    minHeight: 86,
    borderRadius: 30,
    backgroundColor: '#1ec7eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1ec7eb',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  createButtonDisabled: {
    opacity: 0.55,
  },
  createButtonPressed: {
    opacity: 0.85,
  },
  createButtonLabel: {
    color: '#031622',
    fontSize: 23,
    fontWeight: '800',
  },
});
