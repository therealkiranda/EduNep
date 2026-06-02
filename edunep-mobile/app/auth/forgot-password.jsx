import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function ForgotPassword() {
  const router = useRouter();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      Toast.show({ type: 'success', text1: 'Reset link sent!', text2: 'Check your email.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed', text2: 'Email not found.' });
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FBFF' }}>
      <View style={s.container}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back to Login</Text>
        </TouchableOpacity>
        <Text style={s.title}>Forgot Password?</Text>
        <Text style={s.subtitle}>Enter your email and we'll send a reset link.</Text>
        {sent ? (
          <View style={s.successBox}>
            <Text style={s.successIcon}>📧</Text>
            <Text style={s.successTitle}>Check your email!</Text>
            <Text style={s.successText}>A password reset link has been sent to {email}</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')} style={s.btn}>
              <LinearGradient colors={['#0D4C78','#1B6CA8']} style={s.btnGrad}>
                <Text style={s.btnText}>Back to Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <View>
              <Text style={s.label}>Email Address</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ borderRadius: 14, overflow: 'hidden' }}>
              <LinearGradient colors={['#0D4C78','#1B6CA8']} style={s.btnGrad}>
                {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={s.btnText}>Send Reset Link</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, padding: 24, paddingTop: 16 },
  backBtn:      { marginBottom: 28 },
  backText:     { color: '#1B6CA8', fontFamily: 'DMSans-Medium', fontSize: 14 },
  title:        { fontFamily: 'PlayfairDisplay-Bold', fontSize: 26, color: '#1A2535', marginBottom: 8 },
  subtitle:     { fontFamily: 'DMSans-Regular', fontSize: 14, color: '#6B7A8D', marginBottom: 28 },
  label:        { fontFamily: 'DMSans-Medium', fontSize: 13, color: '#374151', marginBottom: 8 },
  input:        { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: 'DMSans-Regular', color: '#1A2535' },
  btnGrad:      { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  btnText:      { color: '#fff', fontFamily: 'DMSans-SemiBold', fontSize: 15 },
  successBox:   { alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#D1FAE5' },
  successIcon:  { fontSize: 48, marginBottom: 12 },
  successTitle: { fontFamily: 'DMSans-SemiBold', fontSize: 18, color: '#065F46', marginBottom: 8 },
  successText:  { fontFamily: 'DMSans-Regular', fontSize: 13, color: '#6B7A8D', textAlign: 'center', marginBottom: 20 },
  btn:          { width: '100%', borderRadius: 14, overflow: 'hidden' },
});
