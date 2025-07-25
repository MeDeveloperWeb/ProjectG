import { useEffect } from 'react';
import { Platform, AppState } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

export const useFullScreenMode = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let appStateSubscription: any;

    const configureFullScreen = async () => {
      try {
        // Set system UI to be completely immersive
        await SystemUI.setBackgroundColorAsync('#000000');
        
        // Hide navigation bar
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setBackgroundColorAsync('#00000000');
        
        console.log('Full screen mode configured');
      } catch (error) {
        console.log('Failed to configure full screen mode:', error);
      }
    };

    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Re-hide navigation bar when app becomes active
        try {
          await NavigationBar.setVisibilityAsync('hidden');
        } catch (error) {
          console.log('Failed to re-hide navigation bar:', error);
        }
      }
    };

    const setupFullScreen = async () => {
      await configureFullScreen();
      
      // Listen for app state changes to maintain full screen
      appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    };

    setupFullScreen();

    // Cleanup
    return () => {
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
    };
  }, []);
};
