import { Tabs } from 'expo-router';
import { Text } from 'react-native';
function TabIcon({ emoji, focused }) { return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>; }
export default function TeacherLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1B6CA8', tabBarInactiveTintColor: '#9CA3AF', tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#F3F4F6', height: 60, paddingBottom: 8 }, tabBarLabelStyle: { fontFamily: 'DMSans-Medium', fontSize: 10 } }}>
      <Tabs.Screen name="index"       options={{ title: 'Dashboard',  tabBarIcon: p => <TabIcon emoji="🏠" {...p} /> }} />
      <Tabs.Screen name="attendance"  options={{ title: 'Attendance', tabBarIcon: p => <TabIcon emoji="✅" {...p} /> }} />
      <Tabs.Screen name="assignments" options={{ title: 'Tasks',      tabBarIcon: p => <TabIcon emoji="📝" {...p} /> }} />
      <Tabs.Screen name="grades"      options={{ title: 'Grades',     tabBarIcon: p => <TabIcon emoji="🏆" {...p} /> }} />
      <Tabs.Screen name="more"        options={{ title: 'More',       tabBarIcon: p => <TabIcon emoji="⋯"  {...p} /> }} />
    </Tabs>
  );
}
