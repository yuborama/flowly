import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

import { AppPalette, TextSizes } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type TaskCameraModalProps = {
  visible: boolean;
  onClose: () => void;
  onPhotoCaptured: (uri: string) => void;
};

export function TaskCameraModal(props: TaskCameraModalProps) {
  const { visible, onClose, onPhotoCaptured } = props;
  const { palette, textSizes } = useAppTheme();
  const styles = createStyles(palette, textSizes);
  const cameraRef = useRef<Camera>(null);
  const [cameraPosition, setCameraPosition] = useState<"back" | "front">(
    "back",
  );
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission: requestCameraPermission } =
    useCameraPermission();

  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (!hasPermission) {
      void requestCameraPermission();
    }
  }, [hasPermission, requestCameraPermission, visible]);

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      const file = await cameraRef.current.takePhoto({ flash: flashMode });
      const uri = file.path.startsWith("file://")
        ? file.path
        : `file://${file.path}`;
      setCapturedUri(uri);
    } finally {
      setIsCapturing(false);
    }
  };

  const closeAndReset = () => {
    setCapturedUri(null);
    setIsCapturing(false);
    setFlashMode("off");
    setCameraPosition("back");
    onClose();
  };

  const confirmPhoto = () => {
    if (!capturedUri) {
      return;
    }
    onPhotoCaptured(capturedUri);
    closeAndReset();
  };

  const renderContent = () => {
    if (!hasPermission) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>
            Camera permission is required.
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => void requestCameraPermission()}
          >
            <Text style={styles.primaryBtnLabel}>Grant Permission</Text>
          </Pressable>
        </View>
      );
    }

    if (!device) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>No camera device available.</Text>
        </View>
      );
    }

    return (
      <View style={styles.previewWrap}>
        {capturedUri ? (
          <Image
            source={{ uri: capturedUri }}
            style={styles.previewImage}
            contentFit="cover"
          />
        ) : (
          <Camera
            ref={cameraRef}
            style={styles.cameraView}
            device={device}
            isActive={visible}
            photo
          />
        )}

        <View pointerEvents="none" style={styles.gridOverlay}>
          <View style={styles.gridRow}>
            <View style={styles.gridCell} />
            <View style={styles.gridCell} />
            <View style={styles.gridCell} />
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridCell} />
            <View style={styles.gridCell} />
            <View style={styles.gridCell} />
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridCell} />
            <View style={styles.gridCell} />
            <View style={styles.gridCell} />
          </View>
        </View>

        <View style={styles.topBar}>
          <Pressable
            testID="camera-close-button"
            onPress={closeAndReset}
            style={styles.iconButton}
          >
            <Ionicons name="close" size={32} color="#e5e7eb" />
          </Pressable>
          <Text style={styles.topTitle}>Attach to Task</Text>
          <Pressable
            testID="camera-flash-toggle"
            onPress={() =>
              setFlashMode((prev) => (prev === "off" ? "on" : "off"))
            }
            style={styles.iconButton}
          >
            <Ionicons
              name={flashMode === "on" ? "flash" : "flash-off"}
              size={28}
              color="#e5e7eb"
            />
          </Pressable>
        </View>

        <View style={styles.bottomPanel}>
          <View style={styles.captureRow}>
            <View style={styles.thumbSlot}>
              {capturedUri ? (
                <Image
                  source={{ uri: capturedUri }}
                  style={styles.thumbImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="images-outline" size={30} color="#e5e7eb" />
              )}
            </View>
            <Pressable
              testID="camera-capture-button"
              style={[styles.shutterOuter, isCapturing && styles.disabled]}
              disabled={isCapturing}
              onPress={() => void capturePhoto()}
            >
              <View style={styles.shutterInner} />
            </Pressable>
            <Pressable
              testID="camera-switch-button"
              style={styles.switchButton}
              onPress={() =>
                setCameraPosition((prev) =>
                  prev === "back" ? "front" : "back",
                )
              }
            >
              <Ionicons
                name="camera-reverse-outline"
                size={28}
                color="#e5e7eb"
              />
            </Pressable>
          </View>

          {capturedUri ? (
            <View style={styles.actionsRow}>
              <Pressable
                testID="camera-retake-button"
                style={styles.secondaryBtn}
                onPress={() => setCapturedUri(null)}
              >
                <Text style={styles.secondaryBtnLabel}>Retake</Text>
              </Pressable>
              <Pressable
                testID="camera-use-photo-button"
                style={styles.primaryBtn}
                onPress={confirmPhoto}
              >
                <Text style={styles.primaryBtnLabel}>Use Photo</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={closeAndReset}
    >
      <SafeAreaView style={styles.modal} edges={["top", "bottom"]}>
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(
  palette: (typeof AppPalette)[keyof typeof AppPalette],
  textSizes: typeof TextSizes,
) {
  return StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: "#000",
    },
    previewWrap: {
      flex: 1,
    },
    previewImage: {
      flex: 1,
      width: "100%",
      backgroundColor: "#000",
    },
    cameraView: {
      flex: 1,
    },
    gridOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "space-between",
    },
    gridRow: {
      flex: 1,
      flexDirection: "row",
    },
    gridCell: {
      flex: 1,
      borderColor: "rgba(148,163,184,0.22)",
      borderWidth: 0.5,
    },
    topBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    topTitle: {
      color: "#e5e7eb",
      fontSize: textSizes.xl,
      fontWeight: "700",
    },
    iconButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    bottomPanel: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 30,
      backgroundColor: "rgba(2,16,28,0.96)",
      borderTopWidth: 1,
      borderTopColor: "rgba(30,58,95,0.7)",
      gap: 20,
    },
    captureRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    thumbSlot: {
      width: 80,
      height: 80,
      borderRadius: 16,
      backgroundColor: "#1e293b",
      borderWidth: 1,
      borderColor: "#334155",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    thumbImage: {
      width: "100%",
      height: "100%",
    },
    switchButton: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1f2c48",
    },
    shutterOuter: {
      width: 108,
      height: 108,
      borderRadius: 54,
      borderWidth: 5,
      borderColor: "#f8fafc",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    shutterInner: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: "#e2e8f0",
      borderWidth: 2,
      borderColor: "#94a3b8",
    },
    actionsRow: {
      flexDirection: "row",
      gap: 14,
      justifyContent: "center",
    },
    primaryBtn: {
      flex: 1,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.accent,
    },
    primaryBtnLabel: {
      color: palette.background,
      fontWeight: "700",
      fontSize: textSizes.md,
    },
    secondaryBtn: {
      flex: 1,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1f2c48",
      borderWidth: 1,
      borderColor: "#334155",
    },
    secondaryBtnLabel: {
      color: "#e5e7eb",
      fontWeight: "700",
      fontSize: textSizes.md,
    },
    fallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      paddingHorizontal: 20,
    },
    fallbackText: {
      color: palette.text,
      fontSize: textSizes.md,
      textAlign: "center",
    },
    disabled: {
      opacity: 0.55,
    },
  });
}
