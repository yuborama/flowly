import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';

import { useAppStore } from '@/store/app-store';

export default function EntryScreen() {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const isHydrated = useAppStore((state) => state.isHydrated);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)' : '/register'} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
