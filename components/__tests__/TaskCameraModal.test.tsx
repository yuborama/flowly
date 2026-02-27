import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import { TaskCameraModal } from "@/components/TaskCameraModal";

const mockTakePhoto = jest.fn();
const mockRequestPermission = jest.fn();
const mockUseCameraPermission = jest.fn();

jest.mock("expo-image", () => ({
  Image: (props: object) => {
    const { View } = require("react-native");
    return <View {...props} />;
  },
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("@/hooks/use-app-theme", () => ({
  useAppTheme: () => ({
    palette: { accent: "#00a3ff", background: "#ffffff", text: "#111111" },
    textSizes: { md: 16, xl: 24 },
  }),
}));

jest.mock("react-native-vision-camera", () => {
  const React = require("react");
  const { View } = require("react-native");

  const Camera = React.forwardRef((_props: object, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      takePhoto: mockTakePhoto,
    }));
    return <View testID="mock-camera" />;
  });

  return {
    Camera,
    useCameraDevice: jest.fn(() => ({ id: "mock-device" })),
    useCameraPermission: (...args: unknown[]) =>
      mockUseCameraPermission(...args),
  };
});

describe("TaskCameraModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests camera permission when opened and no permission exists", async () => {
    mockUseCameraPermission.mockReturnValue({
      hasPermission: false,
      requestPermission: mockRequestPermission,
    });

    const onClose = jest.fn();
    const onPhotoCaptured = jest.fn();

    const screen = render(
      <TaskCameraModal
        visible
        onClose={onClose}
        onPhotoCaptured={onPhotoCaptured}
      />,
    );

    expect(screen.getByText("Camera permission is required.")).toBeTruthy();
    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(screen.getByText("Grant Permission"));
    expect(mockRequestPermission).toHaveBeenCalledTimes(2);
  });

  it("captures and confirms a photo using normalized file URI", async () => {
    mockUseCameraPermission.mockReturnValue({
      hasPermission: true,
      requestPermission: mockRequestPermission,
    });
    mockTakePhoto.mockResolvedValue({ path: "/tmp/task-photo.jpg" });

    const onClose = jest.fn();
    const onPhotoCaptured = jest.fn();

    const screen = render(
      <TaskCameraModal
        visible
        onClose={onClose}
        onPhotoCaptured={onPhotoCaptured}
      />,
    );

    fireEvent.press(screen.getByTestId("camera-capture-button"));

    await waitFor(() => {
      expect(screen.getByTestId("camera-use-photo-button")).toBeTruthy();
    });

    expect(mockTakePhoto).toHaveBeenCalledWith({ flash: "off" });

    fireEvent.press(screen.getByTestId("camera-use-photo-button"));

    expect(onPhotoCaptured).toHaveBeenCalledWith("file:///tmp/task-photo.jpg");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
