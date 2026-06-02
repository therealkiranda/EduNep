import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
function TabIcon({ emoji, focused }) { return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>; }
export default function ParentLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1B6CA8', tabBarInactiveTintColor: '#9CA3AF', tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#F3F4F6', height: 60, paddingBottom: 8 }, tabBarLabelStyle: { fontFamily: 'DMSans-Medium', fontSize: 10 } }}>
      <Tabs.Screen name="index"       options={{ title: 'Home',       tabBarIcon: p => <TabIcon emoji="🏠" {...p} /> }} />
      <Tabs.Screen name="children"    options={{ title: 'My Children', tabBarIcon: p => <TabIcon emoji="👶" {...p} /> }} />
      <Tabs.Screen name="fees"        options={{ title: 'Fees',        tabBarIcon: p => <TabIcon emoji="💳" {...p} /> }} />
      <Tabs.Screen name="messages"    options={{ title: 'Messages',    tabBarIcon: p => <TabIcon emoji="💬" {...p} /> }} />
      <Tabs.Screen name="more"        options={{ title: 'More',        tabBarIcon: p => <TabIcon emoji="⋯"  {...p} /> }} />
    </Tabs>
  );
}
