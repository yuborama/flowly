import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function TabLayout() {
  const { colors, palette } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        headerShown: false,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: colors.border,
        },
        headerTitleStyle: {
          fontWeight: "700",
        },
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tareas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Amigos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
