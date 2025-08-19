import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#000014" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000014',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'CosmicHub' }} />
        <Stack.Screen name="astrology" options={{ title: 'Astrology Charts' }} />
        <Stack.Screen name="healwave" options={{ title: 'Healing Frequencies' }} />
      </Stack>
    </>
  );
}
