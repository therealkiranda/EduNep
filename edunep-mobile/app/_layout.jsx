import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useAuthStore } from '../store/authStore';
import '../locales/i18n';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:       '#1B6CA8',
    secondary:     '#C8A951',
    background:    '#F7FBFF',
    surface:       '#FFFFFF',
    error:         '#EF4444',
    onPrimary:     '#FFFFFF',
    onSecondary:   '#FFFFFF',
    onBackground:  '#1A2535',
    onSurface:     '#1A2535',
    primaryContainer: '#E8F4FD',
    secondaryContainer: '#FDF8EC',
  },
};

// ─── ROLE → ROUTE MAP ────────────────────────────────────────────────────────
const ROLE_HOME = {
  student:      '/(student)',
  parent:       '/(parent)',
  teacher:      '/(teacher)',
  school_admin: '/(admin)',
  super_admin:  '/(admin)',
  accountant:   '/(accountant)',
  hr_officer:   '/(admin)',
  librarian:    '/(admin)',
};

function AuthGuard() {
  const router   = useRouter();
  const segments = useSegments();
  const { token, user, isLoggedIn } = useAuthStore();

  useEffect(() => {
    const inAuth = segments[0] === 'auth';
    if (!isLoggedIn()) {
      if (!inAuth) router.replace('/auth/login');
    } else {
      if (inAuth) {
        const home = ROLE_HOME[user?.role] || '/(student)';
        router.replace(home);
      }
    }
  }, [token, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PlayfairDisplay-Bold':    require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
    'DMSans-Regular':          require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium':           require('../assets/fonts/DMSans-Medium.ttf'),
    'DMSans-SemiBold':         require('../assets/fonts/DMSans-SemiBold.ttf'),
    'NotoSansDevanagari':      require('../assets/fonts/NotoSansDevanagari-Regular.ttf'),
    'NotoSansDevanagari-Bold': require('../assets/fonts/NotoSansDevanagari-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <StatusBar style="auto" />
            <AuthGuard />
            <Toast />
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
