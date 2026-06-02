import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

function TabIcon({ emoji, focused }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function StudentLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor:   '#1B6CA8',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#F3F4F6', height: 60, paddingBottom: 8 },
      tabBarLabelStyle: { fontFamily: 'DMSans-Medium', fontSize: 10 },
    }}>
      <Tabs.Screen name="index"       options={{ title: t('dashboard'),   tabBarIcon: p => <TabIcon emoji="🏠" {...p} /> }} />
      <Tabs.Screen name="timetable"   options={{ title: 'Timetable',      tabBarIcon: p => <TabIcon emoji="📅" {...p} /> }} />
      <Tabs.Screen name="assignments" options={{ title: t('assignments'),  tabBarIcon: p => <TabIcon emoji="📝" {...p} /> }} />
      <Tabs.Screen name="grades"      options={{ title: t('grades'),       tabBarIcon: p => <TabIcon emoji="🏆" {...p} /> }} />
      <Tabs.Screen name="fees"        options={{ title: t('fees'),         tabBarIcon: p => <TabIcon emoji="💳" {...p} /> }} />
      <Tabs.Screen name="more"        options={{ title: 'More',            tabBarIcon: p => <TabIcon emoji="⋯"  {...p} /> }} />
    </Tabs>
  );
}
