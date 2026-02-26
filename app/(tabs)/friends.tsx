import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAppStore } from "@/store/app-store";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendsScreen() {
  const [friendName, setFriendName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const friends = useAppStore((state) => state.friends);
  const tasks = useAppStore((state) => state.tasks);
  const addFriend = useAppStore((state) => state.addFriend);

  const sharedTasksCount = useMemo(
    () => tasks.filter((task) => task.sharedWith.length > 0).length,
    [tasks],
  );

  const handleAddFriend = async () => {
    const cleanedName = friendName.trim();
    if (!cleanedName) {
      return;
    }

    setIsSaving(true);
    try {
      await addFriend(cleanedName);
      setFriendName("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Ionicons name="people" size={30} color="#1ec7eb" />
          <Text style={styles.headerTitle}>Friends</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeLabel}>{friends.length}</Text>
          </View>
        </View>

        <View style={styles.addCard}>
          <Text style={styles.sectionTitle}>ADD NEW FRIEND</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-add-outline" size={26} color="#8aa3ba" />
            <TextInput
              value={friendName}
              onChangeText={setFriendName}
              placeholder="Friend full name"
              placeholderTextColor="#5f7995"
              style={styles.input}
              autoCapitalize="words"
            />
          </View>
          <Pressable
            onPress={handleAddFriend}
            disabled={!friendName.trim() || isSaving}
            style={({ pressed }) => [
              styles.addButton,
              (!friendName.trim() || isSaving) && styles.addButtonDisabled,
              pressed && styles.addButtonPressed,
            ]}
          >
            <Text style={styles.addButtonLabel}>
              {isSaving ? "Adding..." : "Add Friend"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Friends</Text>
            <Text style={styles.metricValue}>{friends.length}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Shared Tasks</Text>
            <Text style={styles.metricValue}>{sharedTasksCount}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>YOUR FRIENDS</Text>
        <View style={styles.listWrap}>
          {friends.map((friend) => (
            <View key={friend.id} style={styles.friendCard}>
              <View style={styles.friendLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarLabel}>
                    {friend.name.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendSub}>Local collaborator</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#7b92ab" />
            </View>
          ))}

          {friends.length === 0 ? (
            <Text style={styles.emptyText}>
              No friends yet. Add your first collaborator above.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#031d29",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 34,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  headerTitle: {
    color: "#e5edf6",
    fontSize: 24,
    fontWeight: "700",
  },
  headerBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#123449",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerBadgeLabel: {
    color: "#1ec7eb",
    fontWeight: "700",
    fontSize: 14,
  },
  addCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1f3f53",
    backgroundColor: "#0b2234",
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    color: "#8ea3ba",
    fontSize: 14,
    letterSpacing: 1.6,
    fontWeight: "700",
  },
  inputWrap: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#244660",
    backgroundColor: "#11273b",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    color: "#e5edf6",
    fontSize: 17,
  },
  addButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#1ec7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonPressed: {
    opacity: 0.84,
  },
  addButtonLabel: {
    color: "#031622",
    fontSize: 18,
    fontWeight: "800",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f3f53",
    backgroundColor: "#0b2234",
    minHeight: 102,
    padding: 12,
    justifyContent: "space-between",
  },
  metricLabel: {
    color: "#91a3b7",
    fontSize: 14,
    fontWeight: "500",
  },
  metricValue: {
    color: "#e5edf6",
    fontSize: 34,
    fontWeight: "700",
  },
  listWrap: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f3f53",
    backgroundColor: "#0b2234",
    overflow: "hidden",
  },
  friendCard: {
    minHeight: 78,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1f3f53",
  },
  friendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1ec7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    color: "#032033",
    fontWeight: "800",
    fontSize: 18,
  },
  friendName: {
    color: "#ecf2fa",
    fontSize: 18,
    fontWeight: "600",
  },
  friendSub: {
    color: "#7b92ab",
    fontSize: 13,
  },
  emptyText: {
    color: "#8ca2ba",
    textAlign: "center",
    fontSize: 14,
    paddingVertical: 16,
  },
});
