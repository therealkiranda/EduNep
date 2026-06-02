import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ title, value, emoji, color = '#1B6CA8', bg = '#EBF4FF', loading }) {
  return (
    <View style={[cardStyles.card, { borderLeftColor: color }]}>
      <View style={[cardStyles.iconBox, { backgroundColor: bg }]}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <Text style={cardStyles.title}>{title}</Text>
      {loading
        ? <View style={cardStyles.skeleton} />
        : <Text style={[cardStyles.value, { color }]}>{value ?? '—'}</Text>
      }
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flex: 1, borderLeftWidth: 3, shadowColor: '#1B6CA8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { fontSize: 11, color: '#6B7A8D', fontFamily: 'DMSans-Medium', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  value: { fontSize: 22, fontFamily: 'PlayfairDisplay-Bold' },
  skeleton: { height: 22, width: 60, backgroundColor: '#F3F4F6', borderRadius: 6 },
});

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={shStyles.row}>
      <Text style={shStyles.title}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={shStyles.action}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const shStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontFamily: 'DMSans-SemiBold', fontSize: 15, color: '#1A2535' },
  action: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#1B6CA8' },
});

// ─── BADGE ───────────────────────────────────────────────────────────────────
export function Badge({ label, color = 'blue' }) {
  const colors = {
    green:  { bg: '#D1FAE5', text: '#065F46' },
    red:    { bg: '#FEE2E2', text: '#991B1B' },
    blue:   { bg: '#DBEAFE', text: '#1E40AF' },
    gold:   { bg: '#FEF3C7', text: '#92400E' },
    gray:   { bg: '#F3F4F6', text: '#374151' },
    purple: { bg: '#EDE9FE', text: '#5B21B6' },
    orange: { bg: '#FFEDD5', text: '#9A3412' },
  };
  const c = colors[color] || colors.gray;
  return (
    <View style={[bdgStyles.badge, { backgroundColor: c.bg }]}>
      <Text style={[bdgStyles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}
const bdgStyles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  text:  { fontSize: 11, fontFamily: 'DMSans-SemiBold', textTransform: 'capitalize' },
});

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export function Button({ label, onPress, variant = 'primary', loading, icon, small }) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading} style={{ borderRadius: 14, overflow: 'hidden' }}>
        <LinearGradient colors={['#0D4C78','#1B6CA8']} style={[btnStyles.base, small && btnStyles.small]}>
          {loading ? <ActivityIndicator color="white" size="small" /> : (
            <>{icon && <Text style={{ marginRight: 6 }}>{icon}</Text>}
              <Text style={btnStyles.primaryText}>{label}</Text></>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  if (variant === 'secondary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading}
        style={[btnStyles.base, btnStyles.secondary, small && btnStyles.small]}>
        {icon && <Text style={{ marginRight: 6 }}>{icon}</Text>}
        <Text style={btnStyles.secondaryText}>{label}</Text>
      </TouchableOpacity>
    );
  }
  if (variant === 'ghost') {
    return (
      <TouchableOpacity onPress={onPress} style={[btnStyles.ghost, small && btnStyles.small]}>
        {icon && <Text style={{ marginRight: 4 }}>{icon}</Text>}
        <Text style={btnStyles.ghostText}>{label}</Text>
      </TouchableOpacity>
    );
  }
  return null;
}
const btnStyles = StyleSheet.create({
  base:          { paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  small:         { paddingVertical: 9, paddingHorizontal: 14 },
  primaryText:   { color: '#fff', fontFamily: 'DMSans-SemiBold', fontSize: 14 },
  secondary:     { backgroundColor: '#EBF4FF', borderWidth: 1.5, borderColor: '#90C3EF' },
  secondaryText: { color: '#1B6CA8', fontFamily: 'DMSans-SemiBold', fontSize: 14 },
  ghost:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  ghostText:     { color: '#1B6CA8', fontFamily: 'DMSans-Medium', fontSize: 13 },
});

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[crdStyles.card, style]}>{children}</View>;
}
const crdStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#1B6CA8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginBottom: 0 },
});

// ─── AVATAR ──────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 36, color = '#1B6CA8', bg = '#EBF4FF' }) {
  return (
    <View style={[avStyles.box, { width: size, height: size, borderRadius: size / 4, backgroundColor: bg }]}>
      <Text style={[avStyles.text, { color, fontSize: size * 0.38 }]}>{name?.[0]?.toUpperCase() || '?'}</Text>
    </View>
  );
}
const avStyles = StyleSheet.create({
  box:  { alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: 'DMSans-SemiBold' },
});

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export function EmptyState({ emoji = '📭', title, description }) {
  return (
    <View style={emStyles.wrap}>
      <Text style={emStyles.emoji}>{emoji}</Text>
      <Text style={emStyles.title}>{title}</Text>
      {description && <Text style={emStyles.desc}>{description}</Text>}
    </View>
  );
}
const emStyles = StyleSheet.create({
  wrap:  { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: { fontFamily: 'DMSans-SemiBold', fontSize: 15, color: '#374151', marginBottom: 4, textAlign: 'center' },
  desc:  { fontFamily: 'DMSans-Regular', fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});

// ─── LIST ROW ─────────────────────────────────────────────────────────────────
export function ListRow({ title, subtitle, right, onPress, emoji, avatar }) {
  return (
    <TouchableOpacity onPress={onPress} style={lrStyles.row} activeOpacity={0.7}>
      {emoji && <View style={lrStyles.emojiBox}><Text style={{ fontSize: 18 }}>{emoji}</Text></View>}
      {avatar && <Avatar name={avatar} size={40} />}
      <View style={lrStyles.content}>
        <Text style={lrStyles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={lrStyles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {right && <View style={lrStyles.right}>{right}</View>}
    </TouchableOpacity>
  );
}
const lrStyles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#fff', gap: 12 },
  emojiBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  content:  { flex: 1 },
  title:    { fontFamily: 'DMSans-SemiBold', fontSize: 14, color: '#1A2535', marginBottom: 2 },
  subtitle: { fontFamily: 'DMSans-Regular', fontSize: 12, color: '#6B7A8D' },
  right:    { alignItems: 'flex-end' },
});

// ─── DIVIDER ─────────────────────────────────────────────────────────────────
export function Divider() {
  return <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 }} />;
}

// ─── LOADING FULL SCREEN ─────────────────────────────────────────────────────
export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7FBFF' }}>
      <ActivityIndicator size="large" color="#1B6CA8" />
      <Text style={{ marginTop: 12, fontFamily: 'DMSans-Regular', color: '#6B7A8D', fontSize: 13 }}>{message}</Text>
    </View>
  );
}
