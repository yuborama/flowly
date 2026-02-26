import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { AppPalette, TextSizes } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { TaskFilter, useAppStore } from "@/store/app-store";

const FILTER_OPTIONS: {
  value: TaskFilter;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "all",
    title: "All Tasks",
    description: "Show everything in your workspace",
    icon: "list",
  },
  {
    value: "pending",
    title: "Pending",
    description: "Tasks currently in progress",
    icon: "time-outline",
  },
  {
    value: "completed",
    title: "Completed",
    description: "Recently finished items",
    icon: "checkmark-done-circle-outline",
  },
  {
    value: "shared",
    title: "Shared with Friends",
    description: "Tasks involving collaborators",
    icon: "people-outline",
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { colors, palette, textSizes } = useAppTheme();
  const styles = createStyles(palette, textSizes);

  const friends = useAppStore((state) => state.friends);
  const tasks = useAppStore((state) => state.tasks);
  const currentFilter = useAppStore((state) => state.taskFilter);
  const setTaskFilter = useAppStore((state) => state.setTaskFilter);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const syncFromApi = useAppStore((state) => state.syncFromApi);
  const isSyncing = useAppStore((state) => state.isSyncing);

  const filteredTasks = useMemo(() => {
    switch (currentFilter) {
      case "completed":
        return tasks.filter((task) => task.completed);
      case "pending":
        return tasks.filter((task) => !task.completed);
      case "shared":
        return tasks.filter((task) => task.sharedWith.length > 0);
      case "all":
      default:
        return tasks;
    }
  }, [currentFilter, tasks]);

  const [draftFilter, setDraftFilter] = useState<TaskFilter>(currentFilter);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const sheetHeight = useSharedValue(0);
  const openProgress = useSharedValue(0);
  const progress = useDerivedValue(() =>
    withTiming(openProgress.value, { duration: 320 }),
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - progress.value) * (sheetHeight.value + 56) },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.58,
    zIndex:
      openProgress.value > 0
        ? 10
        : withDelay(320, withTiming(-1, { duration: 0 })),
  }));

  const openFilterSheet = () => {
    setDraftFilter(currentFilter);
    setIsSheetOpen(true);
    openProgress.value = 1;
  };

  const closeFilterSheet = () => {
    openProgress.value = 0;
    setIsSheetOpen(false);
  };

  const applyFilter = () => {
    setTaskFilter(draftFilter);
    closeFilterSheet();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.subtitle}>
            {filteredTasks.length} tasks for today
          </Text>
        </View>

        <View style={styles.headerActions}>
          <View style={styles.roundAction}>
            <Ionicons name="search" size={16} color={colors.text} />
          </View>
          <Pressable onPress={openFilterSheet} style={styles.roundAction}>
            <Ionicons name="options-outline" size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isSyncing} onRefresh={() => void syncFromApi()} />}>
        {filteredTasks.map((task) => (
          <Pressable
            key={task.id}
            style={styles.taskCard}
            onPress={() =>
              router.push({ pathname: "/task/[id]", params: { id: task.id } })
            }
          >
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                void toggleTask(task.id);
              }}
              style={[styles.checkbox, task.completed && styles.checkboxDone]}
            >
              {task.completed ? (
                <Ionicons name="checkmark" size={15} color={palette.text} />
              ) : null}
            </Pressable>

            <View style={styles.taskMain}>
              <Text
                style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleDone,
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              <Text style={styles.taskSubline}>
                {task.completed ? "Completed today" : "Due soon"} •{" "}
                {task.sharedWith.length > 0 ? "High Priority" : "Personal"}
              </Text>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View style={styles.avatarStack}>
                  {task.sharedWith.slice(0, 2).map((friendId, index) => {
                    const friend = friends.find((item) => item.id === friendId);
                    const initial =
                      friend?.name.slice(0, 1).toUpperCase() ?? "?";
                    return (
                      <View
                        key={`${task.id}_${friendId}`}
                        style={[
                          styles.sharedAvatar,
                          { marginLeft: index === 0 ? 0 : -9 },
                        ]}
                      >
                        <Text style={styles.sharedAvatarLabel}>{initial}</Text>
                      </View>
                    );
                  })}
                  {task.sharedWith.length > 2 ? (
                    <View
                      style={[styles.sharedAvatar, styles.sharedAvatarMore]}
                    >
                      <Text style={styles.sharedAvatarLabel}>
                        +{task.sharedWith.length - 2}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardTag}>
                  {task.sharedWith.length > 0 ? "SHARED" : "PRIVATE"}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}

        {filteredTasks.length === 0 ? (
          <Text style={styles.emptyText}>No hay tareas para este filtro.</Text>
        ) : null}
      </ScrollView>

      <Pressable
        onPress={() =>
          router.push({ pathname: "/task/[id]", params: { id: "new" } })
        }
        style={styles.fab}
      >
        <Ionicons name="add" size={32} color={palette.background} />
      </Pressable>

      <Animated.View
        pointerEvents={isSheetOpen ? "auto" : "none"}
        style={[styles.backdrop, backdropStyle]}
      >
        <Pressable style={styles.flex} onPress={closeFilterSheet} />
      </Animated.View>

      <Animated.View
        style={[styles.bottomSheet, sheetStyle]}
        onLayout={(event) => {
          sheetHeight.value = event.nativeEvent.layout.height;
        }}
      >
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filter Tasks</Text>
          <Pressable onPress={closeFilterSheet} style={styles.sheetCloseButton}>
            <Ionicons name="close" size={32} color={palette.textMuted} />
          </Pressable>
        </View>

        <View style={styles.sheetOptions}>
          {FILTER_OPTIONS.map((option) => {
            const selected = draftFilter === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setDraftFilter(option.value)}
                style={styles.sheetOptionCard}
              >
                <View style={styles.sheetOptionIcon}>
                  <Ionicons
                    name={option.icon}
                    size={25}
                    color={palette.accent}
                  />
                </View>
                <View style={styles.sheetOptionTextWrap}>
                  <Text style={styles.sheetOptionTitle}>{option.title}</Text>
                  <Text style={styles.sheetOptionDescription}>
                    {option.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.sheetRadio,
                    selected && styles.sheetRadioSelected,
                  ]}
                >
                  {selected ? <View style={styles.sheetRadioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sheetActions}>
          <Pressable
            onPress={() => setDraftFilter("all")}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonLabel}>Reset</Text>
          </Pressable>
          <Pressable onPress={applyFilter} style={styles.applyButton}>
            <Text style={styles.applyButtonLabel}>Apply Filter</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

function createStyles(
  palette: (typeof AppPalette)[keyof typeof AppPalette],
  textSizes: typeof TextSizes,
) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 60,
      backgroundColor: palette.background,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerActions: {
      flexDirection: "row",
      gap: 10,
    },
    roundAction: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.surfaceAlt,
    },
    title: {
      fontSize: textSizes.h1,
      fontWeight: "700",
      color: palette.text,
    },
    subtitle: {
      marginTop: 2,
      color: palette.textMuted,
      fontSize: textSizes.md,
    },
    listContent: {
      gap: 16,
      paddingTop: 20,
      paddingBottom: 120,
    },
    taskCard: {
      backgroundColor: palette.surfaceAlt,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 18,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    checkbox: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1.5,
      borderColor: palette.borderSoft,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    checkboxDone: { backgroundColor: palette.surface },
    taskMain: { flex: 1, gap: 8 },
    taskTitle: {
      fontSize: textSizes.title,
      lineHeight: 30,
      color: palette.text,
      fontWeight: "600",
    },
    taskTitleDone: {
      textDecorationLine: "line-through",
      color: palette.textSubtle,
    },
    taskSubline: { color: palette.textMuted, fontSize: textSizes.lg },
    cardDivider: { marginTop: 8, height: 1, backgroundColor: palette.border },
    cardFooter: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    avatarStack: { flexDirection: "row", alignItems: "center" },
    sharedAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1.5,
      borderColor: palette.borderSoft,
      backgroundColor: palette.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    sharedAvatarMore: {
      backgroundColor: palette.textSubtle,
      marginLeft: -9,
    },
    sharedAvatarLabel: {
      color: palette.text,
      fontWeight: "700",
      fontSize: textSizes.sm,
    },
    cardTag: {
      color: palette.textMuted,
      fontSize: textSizes.md,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
    emptyText: {
      color: palette.textMuted,
      textAlign: "center",
      marginTop: 28,
      fontSize: textSizes.md,
    },
    fab: {
      position: "absolute",
      right: 22,
      bottom: 26,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: palette.accentStrong,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: palette.accentStrong,
      shadowOpacity: 0.45,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#020617",
    },
    bottomSheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: palette.background,
      borderTopWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 24,
      gap: 16,
      zIndex: 11,
    },
    sheetHandle: {
      width: 90,
      height: 10,
      borderRadius: 999,
      backgroundColor: palette.textSubtle,
      alignSelf: "center",
    },
    sheetHeader: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sheetTitle: {
      color: palette.text,
      fontSize: textSizes.xl,
      fontWeight: "700",
    },
    sheetCloseButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: palette.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    sheetOptions: { gap: 12 },
    sheetOptionCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.borderSoft,
      backgroundColor: palette.surface,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    sheetOptionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: palette.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    sheetOptionTextWrap: { flex: 1, gap: 2 },
    sheetOptionTitle: {
      color: palette.text,
      fontSize: textSizes.lg,
      fontWeight: "700",
    },
    sheetOptionDescription: {
      color: palette.textMuted,
      fontSize: textSizes.sm,
    },
    sheetRadio: {
      width: 14,
      height: 14,
      borderRadius: 17,
      borderWidth: 1.8,
      borderColor: palette.borderSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    sheetRadioSelected: { borderColor: palette.accent },
    sheetRadioDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: palette.accent,
    },
    sheetActions: {
      borderTopWidth: 1,
      borderTopColor: palette.border,
      paddingTop: 16,
      flexDirection: "row",
      gap: 12,
    },
    resetButton: {
      flex: 1,
      borderRadius: 18,
      backgroundColor: palette.surfaceAlt,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    resetButtonLabel: {
      color: palette.text,
      fontSize: textSizes.md,
      fontWeight: "700",
    },
    applyButton: {
      flex: 2,
      borderRadius: 18,
      backgroundColor: palette.accent,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: palette.accent,
      shadowOpacity: 0.28,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    applyButtonLabel: {
      color: palette.background,
      fontSize: textSizes.md,
      fontWeight: "800",
    },
  });
}
