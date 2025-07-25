// Import global polyfills first
import '../global-polyfills';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useFullScreenMode } from '@/hooks/useFullScreenMode';
import { View } from '@/components/Themed';
import { StatusBar as CustomStatusBar } from '@/components/StatusBar';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading keeps the home screen as initial route
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Enable full screen mode
  useFullScreenMode();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar hidden />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <CustomStatusBar />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen 
              name="calculator" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                animation: 'slide_from_bottom'
              }} 
            />
            <Stack.Screen 
              name="notes" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                animation: 'slide_from_right'
              }} 
            />
            <Stack.Screen 
              name="messages" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right'
              }} 
            />
            <Stack.Screen 
              name="contacts" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right'
              }} 
            />
            <Stack.Screen 
              name="settings" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right'
              }} 
            />
            <Stack.Screen 
              name="notifications" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_bottom'
              }} 
            />
          </Stack>
        </View>
      </ThemeProvider>
    </>
  );
}
