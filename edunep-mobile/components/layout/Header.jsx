import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';

export default function Header({ title, showBack = false, right }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { i18n } = useTranslation();

  return (
    <View style={s.header}>
      <View style={s.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        {title && <Text style={s.title} numberOfLines={1}>{title}</Text>}
      </View>
      <View style={s.right}>
        <TouchableOpacity onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')} style={s.langBtn}>
          <Text style={s.langText}>{i18n.language === 'en' ? 'NE' : 'EN'}</Text>
        </TouchableOpacity>
        {right}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  left:    { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  right:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { padding: 4 },
  backIcon:{ fontSize: 20, color: '#1B6CA8' },
  title:   { fontFamily: 'DMSans-SemiBold', fontSize: 16, color: '#1A2535', flex: 1 },
  langBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#EBF4FF' },
  langText:{ fontFamily: 'DMSans-SemiBold', fontSize: 11, color: '#1B6CA8' },
});
