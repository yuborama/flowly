import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppStore } from "@/store/app-store";
import { SafeAreaView } from "react-native-safe-area-context";

function SettingRow({
  icon,
  title,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
}) {
  return (
    <Pressable style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={30} color="#1ec7eb" />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={22} color="#7b92ab" />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const friends = useAppStore((state) => state.friends);
  const tasks = useAppStore((state) => state.tasks);
  const resetData = useAppStore((state) => state.resetData);

  const profileId = `#${(user?.id ?? "AX92841").slice(0, 7).toUpperCase()}`;

  const handleReset = () => {
    Alert.alert(
      "Resetear datos",
      "Se borraran usuario, amigos y tareas locales.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetear",
          style: "destructive",
          onPress: async () => {
            await resetData();
            router.replace("/register");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Ionicons name="chevron-back" size={38} color="#e5edf6" />
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>
              {user?.name.slice(0, 1).toUpperCase() ?? "A"}
            </Text>
            <View style={styles.editAvatar}>
              <Ionicons name="create-outline" size={20} color="#032033" />
            </View>
          </View>

          <Text style={styles.userName}>{user?.name ?? "Alex Rivera"}</Text>
          <Text style={styles.userId}>ID: {profileId}</Text>
          <Text style={styles.memberSince}>Member since Feb 2026</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHead}>
              <Ionicons name="clipboard-outline" size={28} color="#1ec7eb" />
              <Text style={styles.statTitle}>Total Tasks</Text>
            </View>
            <Text style={styles.statValue}>{tasks.length}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHead}>
              <Ionicons name="people-outline" size={28} color="#1ec7eb" />
              <Text style={styles.statTitle}>Friends</Text>
            </View>
            <Text style={styles.statValue}>{friends.length}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>APP PREFERENCES</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="sync-outline"
            title="Sync Settings"
            value="Auto-sync ON"
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="color-palette-outline"
            title="App Theme"
            value="Dark Mode"
          />
        </View>

        <Text style={styles.sectionLabel}>PRIVACY & SECURITY</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon="eye-outline" title="Profile Visibility" />
          <View style={styles.rowDivider} />
          <SettingRow icon="lock-closed-outline" title="Device Lock" />
        </View>

        <Pressable onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetButtonLabel}>Reset Data</Text>
        </Pressable>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    color: "#e5edf6",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 38,
  },
  profileCard: {
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  avatar: {
    width: 178,
    height: 178,
    borderRadius: 89,
    borderWidth: 4,
    borderColor: "#7ee8ff",
    backgroundColor: "#dbe5ee",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarLabel: {
    color: "#203040",
    fontSize: 70,
    fontWeight: "800",
  },
  editAvatar: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#1ec7eb",
    borderWidth: 3,
    borderColor: "#031d29",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    color: "#ecf2fa",
    fontSize: 48,
    fontWeight: "700",
  },
  userId: {
    color: "#1ec7eb",
    fontSize: 18,
    fontWeight: "600",
  },
  memberSince: {
    color: "#91a3b7",
    fontSize: 18,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1f3f53",
    backgroundColor: "#0b2234",
    padding: 14,
    minHeight: 134,
    justifyContent: "space-between",
  },
  statHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statTitle: {
    color: "#91a3b7",
    fontSize: 16,
    fontWeight: "500",
  },
  statValue: {
    color: "#e5edf6",
    fontSize: 48,
    fontWeight: "700",
  },
  sectionLabel: {
    color: "#8ea3ba",
    fontSize: 14,
    letterSpacing: 1.7,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 6,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1f3f53",
    backgroundColor: "#0b2234",
    marginBottom: 18,
    overflow: "hidden",
  },
  settingRow: {
    minHeight: 84,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingTitle: {
    color: "#ecf2fa",
    fontSize: 22,
    fontWeight: "500",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    color: "#708aa5",
    fontSize: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#1f3f53",
  },
  resetButton: {
    marginTop: 2,
    borderRadius: 16,
    minHeight: 62,
    backgroundColor: "#8b1d1d",
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
