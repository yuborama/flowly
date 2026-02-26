import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppPalette, TextSizes } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAppStore } from "@/store/app-store";

export default function RegisterScreen() {
  const router = useRouter();
  const { palette, textSizes } = useAppTheme();
  const styles = createStyles(palette, textSizes);
  const registerUser = useAppStore((state) => state.registerUser);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleRegister = async () => {
    const cleanedName = name.trim();
    if (!cleanedName) {
      return;
    }

    setIsSaving(true);
    try {
      await registerUser(cleanedName);
      router.replace("/(tabs)");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.topTitle}>Setup Profile</Text>
        <View style={styles.helpBubble}>
          <Ionicons name="help" size={20} color={palette.text} />
        </View>
      </View>

      <View style={styles.imageSlot}>
        <Text style={styles.imageSlotText}>Space for Illustration</Text>
      </View>

      <Text style={styles.heroTitle}>
        Plan Together,{"\n"}
        <Text style={styles.heroAccent}>Anywhere</Text>
      </Text>

      <Text style={styles.description}>
        Create your local profile to start managing tasks offline and
        collaborate seamlessly with your friends.
      </Text>

      <Text style={styles.inputLabel}>YOUR NAME</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="person" size={24} color={palette.textMuted} />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor={palette.textSubtle}
          style={styles.input}
          autoCapitalize="words"
        />
      </View>

      <Pressable
        onPress={handleRegister}
        disabled={!name.trim() || isSaving}
        style={({ pressed }) => [
          styles.button,
          (!name.trim() || isSaving) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonLabel}>
          {isSaving ? "Saving..." : "Get Started  ->"}
        </Text>
      </Pressable>

      <View style={styles.socialRow}>
        <View style={[styles.socialDot, { backgroundColor: "#f5ebd8" }]} />
        <View
          style={[
            styles.socialDot,
            { backgroundColor: "#d4d9b4", marginLeft: -9 },
          ]}
        />
        <View
          style={[styles.socialDot, styles.socialDotCount, { marginLeft: -9 }]}
        >
          <Text style={styles.socialDotCountLabel}>10+</Text>
        </View>
        <Text style={styles.socialText}>Join 2,000+ local collaborators</Text>
      </View>

      <Text style={styles.footerNote}>
        OFFLINE-FIRST • END-TO-END ENCRYPTED
      </Text>
    </ScrollView>
  );
}

function createStyles(
  palette: (typeof AppPalette)[keyof typeof AppPalette],
  textSizes: typeof TextSizes,
) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 40,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    topTitle: {
      fontSize: textSizes.h1,
      color: palette.text,
      fontWeight: "700",
    },
    helpBubble: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: palette.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    imageSlot: {
      marginTop: 24,
      height: 320,
      borderRadius: 24,
      backgroundColor: "#f0d6be",
      borderWidth: 1,
      borderColor: "#e6c4a4",
      alignItems: "center",
      justifyContent: "center",
    },
    imageSlotText: {
      color: "#946f54",
      fontSize: textSizes.xl,
      fontWeight: "600",
    },
    heroTitle: {
      marginTop: 28,
      fontSize: 62,
      lineHeight: 68,
      textAlign: "center",
      color: palette.text,
      fontWeight: "800",
    },
    heroAccent: {
      color: palette.accent,
    },
    description: {
      marginTop: 14,
      fontSize: textSizes.lg,
      lineHeight: 31,
      textAlign: "center",
      color: palette.textMuted,
    },
    inputLabel: {
      marginTop: 26,
      marginBottom: 10,
      color: palette.text,
      fontSize: textSizes.sm,
      letterSpacing: 1.8,
      fontWeight: "700",
    },
    inputWrap: {
      height: 82,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      gap: 10,
    },
    input: {
      flex: 1,
      color: palette.text,
      fontSize: 32,
      fontWeight: "500",
    },
    button: {
      marginTop: 18,
      height: 84,
      borderRadius: 20,
      backgroundColor: palette.accent,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: palette.accent,
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonLabel: {
      color: palette.background,
      fontSize: textSizes.display,
      fontWeight: "800",
    },
    socialRow: {
      marginTop: 22,
      flexDirection: "row",
      alignItems: "center",
    },
    socialDot: {
      width: 46,
      height: 46,
      borderRadius: 23,
    },
    socialDotCount: {
      backgroundColor: palette.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    socialDotCountLabel: {
      color: palette.background,
      fontWeight: "700",
    },
    socialText: {
      marginLeft: 10,
      color: palette.textMuted,
      fontSize: textSizes.md,
      fontWeight: "600",
    },
    footerNote: {
      marginTop: 20,
      color: palette.textSubtle,
      textAlign: "center",
      fontWeight: "700",
      letterSpacing: 2,
      fontSize: textSizes.xs,
    },
  });
}
