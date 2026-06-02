import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { dashboardApi, announcementsApi, calendarApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { StatCard, SectionHeader, Card, Badge, ListRow, Divider, EmptyState } from '../../components/ui';
import { format } from 'date-fns';

export default function StudentHome() {
  const { t, i18n } = useTranslation();
  const { user }    = useAuthStore();
  const router      = useRouter();
  const isNe        = i18n.language === 'ne';

  const { data: dash,  isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => dashboardApi.index().then(r => r.data),
  });
  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn:  () => announcementsApi.list({ per_page: 3 }).then(r => r.data),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (isNe) return h < 12 ? 'शुभ बिहान' : h < 17 ? 'नमस्ते' : 'शुभ साँझ';
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1B6CA8" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={['#0D4C78','#1B6CA8','#2E8CD6']} style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.greeting}>{greeting()},</Text>
              <Text style={s.userName}>{user?.name?.split(' ')[0]} 👋</Text>
              <Text style={s.userRole}>{isNe ? 'विद्यार्थी' : 'Student'}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(student)/more')} style={s.avatarBtn}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick stats row */}
          <View style={s.quickStats}>
            {[
              { label: isNe ? 'उपस्थिति' : 'Attendance', value: `${dash?.stats?.today_attendance ?? 0}%`, color: '#10B981' },
              { label: isNe ? 'GPA' : 'GPA',              value: '3.6',  color: '#C8A951' },
              { label: isNe ? 'बाँकी शुल्क' : 'Fee Due',  value: 'NPR 0', color: '#fff'   },
            ].map(item => (
              <View key={item.label} style={s.quickStat}>
                <Text style={[s.quickVal, { color: item.color }]}>{item.value}</Text>
                <Text style={s.quickLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Stat cards */}
        <View style={s.statsGrid}>
          <StatCard title="Attendance"      value="94%" emoji="✅" color="#10B981" bg="#D1FAE5" loading={isLoading} />
          <StatCard title="Due Today"       value="2"   emoji="📝" color="#C8A951" bg="#FEF3C7" loading={isLoading} />
        </View>
        <View style={[s.statsGrid, s.mt8]}>
          <StatCard title="Fee Balance"     value="NPR 0" emoji="💳" color="#1B6CA8" bg="#EBF4FF" loading={isLoading} />
          <StatCard title="Upcoming Exams"  value="3"     emoji="📖" color="#8B5CF6" bg="#EDE9FE" loading={isLoading} />
        </View>

        {/* Announcements */}
        <View style={s.section}>
          <SectionHeader title={isNe ? 'सूचनाहरू' : 'Announcements'} action="See All" onAction={() => router.push('/(student)/more')} />
          <Card>
            {!announcements?.data?.length ? (
              <EmptyState emoji="📢" title="No announcements" />
            ) : (
              announcements.data.map((a, i) => (
                <View key={a.id}>
                  <ListRow
                    emoji="📢"
                    title={isNe && a.title_ne ? a.title_ne : a.title}
                    subtitle={a.published_at ? format(new Date(a.published_at), 'MMM d, yyyy') : ''}
                    onPress={() => {}}
                  />
                  {i < announcements.data.length - 1 && <Divider />}
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Today's schedule */}
        <View style={s.section}>
          <SectionHeader title={isNe ? 'आजको तालिका' : "Today's Schedule"} action="Full" onAction={() => router.push('/(student)/timetable')} />
          <Card>
            {[
              { time: '9:00 AM',  subject: 'Mathematics',    teacher: 'Mr. Sharma',     room: 'Room 5' },
              { time: '10:00 AM', subject: 'English',        teacher: 'Ms. Thapa',      room: 'Room 5' },
              { time: '11:00 AM', subject: 'Science',        teacher: 'Mr. KC',         room: 'Lab 1'  },
              { time: '1:00 PM',  subject: 'Nepali',         teacher: 'Mr. Gurung',     room: 'Room 5' },
            ].map((cls, i, arr) => (
              <View key={cls.subject}>
                <View style={s.scheduleRow}>
                  <View style={s.scheduleTime}>
                    <Text style={s.scheduleTimeText}>{cls.time}</Text>
                  </View>
                  <View style={s.scheduleInfo}>
                    <Text style={s.scheduleSubject}>{cls.subject}</Text>
                    <Text style={s.scheduleTeacher}>{cls.teacher} · {cls.room}</Text>
                  </View>
                </View>
                {i < arr.length - 1 && <Divider />}
              </View>
            ))}
          </Card>
        </View>

        {/* Upcoming events */}
        {dash?.upcomingEvents?.length > 0 && (
          <View style={[s.section, s.mb20]}>
            <SectionHeader title={isNe ? 'आगामी कार्यक्रमहरू' : 'Upcoming Events'} />
            <Card>
              {dash.upcomingEvents.slice(0, 3).map((e, i, arr) => (
                <View key={e.id}>
                  <ListRow
                    emoji={e.type === 'holiday' ? '🎉' : e.type === 'exam' ? '📝' : '📅'}
                    title={e.title}
                    subtitle={`${e.start_date}${e.start_bs_formatted ? ` · ${e.start_bs_formatted}` : ''}`}
                    right={<Badge label={e.type} color={e.type === 'holiday' ? 'red' : e.type === 'exam' ? 'gold' : 'blue'} />}
                  />
                  {i < arr.length - 1 && <Divider />}
                </View>
              ))}
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#F7FBFF' },
  scroll:          { flex: 1 },
  content:         { paddingBottom: 100 },
  header:          { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting:        { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'DMSans-Regular' },
  userName:        { color: '#fff', fontSize: 22, fontFamily: 'PlayfairDisplay-Bold', marginTop: 2 },
  userRole:        { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'DMSans-Regular', marginTop: 2 },
  avatarBtn:       { padding: 2 },
  avatar:          { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText:      { color: '#fff', fontFamily: 'DMSans-SemiBold', fontSize: 18 },
  quickStats:      { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 12, gap: 0 },
  quickStat:       { flex: 1, alignItems: 'center' },
  quickVal:        { fontFamily: 'PlayfairDisplay-Bold', fontSize: 18, color: '#fff' },
  quickLabel:      { fontFamily: 'DMSans-Regular', fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  statsGrid:       { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 16 },
  mt8:             { marginTop: 8 },
  section:         { paddingHorizontal: 16, marginTop: 20 },
  mb20:            { marginBottom: 20 },
  scheduleRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  scheduleTime:    { width: 70 },
  scheduleTimeText:{ fontSize: 11, fontFamily: 'DMSans-Medium', color: '#1B6CA8' },
  scheduleInfo:    { flex: 1 },
  scheduleSubject: { fontFamily: 'DMSans-SemiBold', fontSize: 13, color: '#1A2535' },
  scheduleTeacher: { fontFamily: 'DMSans-Regular', fontSize: 11, color: '#6B7A8D', marginTop: 1 },
});
