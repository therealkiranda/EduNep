import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import Toast from 'react-native-toast-message';

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

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const router     = useRouter();
  const { login, biometricEnabled, token, user } = useAuthStore();
  const [showPass,  setShowPass]   = useState(false);
  const [loading,   setLoading]    = useState(false);
  const [need2FA,   setNeed2FA]    = useState(false);
  const [bioAvail,  setBioAvail]   = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '', otp: '' },
  });

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(has => {
      LocalAuthentication.isEnrolledAsync().then(enrolled => {
        setBioAvail(has && enrolled);
      });
    });
  }, []);

  const handleBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to EduNep',
        fallbackLabel: 'Use Password',
        cancelLabel:   'Cancel',
      });
      if (result.success && token) {
        const home = ROLE_HOME[user?.role] || '/(student)';
        router.replace(home);
      } else {
        Toast.show({ type: 'error', text1: 'Biometric failed', text2: 'Please use your password.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Biometric error' });
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      if (res.data.two_factor_required) {
        setNeed2FA(true); setLoading(false); return;
      }
      login(res.data.token, res.data.user);
      Toast.show({ type: 'success', text1: `Welcome back, ${res.data.user.name}!` });
      const home = ROLE_HOME[res.data.user.role] || '/(student)';
      router.replace(home);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  const isNe = i18n.language === 'ne';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

        {/* Header gradient */}
        <LinearGradient colors={['#0D4C78', '#1B6CA8', '#2E8CD6']} style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>🎓</Text>
            </View>
            <View>
              <Text style={styles.logoText}>Edu<Text style={styles.logoGold}>Nep</Text></Text>
              <Text style={styles.logoSub}>
                {isNe ? 'विद्यालय व्यवस्थापन प्रणाली' : 'School Management System'}
              </Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>
            {isNe ? 'स्वागत छ' : 'Welcome Back'}
          </Text>
          <Text style={styles.headerSub}>
            {isNe ? 'आफ्नो खातामा लगइन गर्नुहोस्' : 'Sign in to your account'}
          </Text>

          {/* Language toggle */}
          <View style={styles.langRow}>
            {['en','ne'].map(l => (
              <TouchableOpacity key={l} onPress={() => i18n.changeLanguage(l)}
                style={[styles.langBtn, i18n.language === l && styles.langBtnActive]}>
                <Text style={[styles.langBtnText, i18n.language === l && styles.langBtnTextActive]}>
                  {l === 'en' ? '🇬🇧 EN' : '🇳🇵 NE'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Form card */}
        <View style={styles.card}>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('email_address')}</Text>
            <Controller control={control} name="email"
              rules={{ required: true, pattern: /^\S+@\S+$/ }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="principal@school.edu.np"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange} value={value}
                />
              )} />
            {errors.email && <Text style={styles.errorText}>Valid email required</Text>}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('password')}</Text>
            <View style={styles.passwordRow}>
              <Controller control={control} name="password" rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.inputFlex, errors.password && styles.inputError]}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPass}
                    onChangeText={onChange} value={value}
                  />
                )} />
              <TouchableOpacity onPress={() => setShowPass(s => !s)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>Password required</Text>}
          </View>

          {/* 2FA OTP */}
          {need2FA && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('two_factor')}</Text>
              <Controller control={control} name="otp"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="000000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={onChange} value={value}
                  />
                )} />
            </View>
          )}

          {/* Forgot password */}
          <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>{t('forgot_password')}</Text>
          </TouchableOpacity>

          {/* Sign in button */}
          <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={loading}
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}>
            <LinearGradient colors={['#0D4C78','#1B6CA8']} style={styles.loginBtnGrad}>
              {loading
                ? <ActivityIndicator color="white" size="small" />
                : <Text style={styles.loginBtnText}>{t('sign_in')}</Text>}
            </LinearGradient>
          </TouchableOpacity>

          {/* Biometric */}
          {bioAvail && biometricEnabled && (
            <TouchableOpacity onPress={handleBiometric} style={styles.bioBtn}>
              <Text style={styles.bioIcon}>👆</Text>
              <Text style={styles.bioBtnText}>
                {isNe ? 'बायोमेट्रिकले लगइन' : 'Login with Biometrics'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Demo credentials hint */}
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Accounts:</Text>
            {[
              ['🎓 Principal', 'principal@edunep.com'],
              ['📚 Teacher',   'teacher@edunep.com'],
              ['💰 Accountant','accountant@edunep.com'],
              ['👤 Student',   'student@edunep.com'],
            ].map(([role, email]) => (
              <Text key={email} style={styles.demoRow}>
                <Text style={styles.demoRole}>{role}: </Text>{email}
              </Text>
            ))}
            <Text style={styles.demoPass}>Password: EduNep@2082</Text>
          </View>

          <Text style={styles.footer}>🇳🇵 EduNep · Made for Nepal's Schools</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingBottom: 36, paddingHorizontal: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  logoBox: { width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 24 },
  logoText: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 22, color: '#fff' },
  logoGold: { color: '#F0D98A' },
  logoSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 1 },
  headerTitle: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 30, color: '#fff', marginBottom: 6 },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 14 },
  langRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  langBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  langBtnActive: { backgroundColor: 'rgba(255,255,255,0.9)' },
  langBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'DMSans-SemiBold' },
  langBtnTextActive: { color: '#1B6CA8' },
  card: { flex: 1, backgroundColor: '#F7FBFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -16, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  fieldGroup: { marginBottom: 18 },
  label: { fontFamily: 'DMSans-Medium', fontSize: 13, color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: 'DMSans-Regular', color: '#1A2535' },
  inputFlex: { flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: 'DMSans-Regular', color: '#1A2535' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  passwordRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  eyeBtn: { padding: 14, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14 },
  eyeIcon: { fontSize: 16 },
  otpInput: { textAlign: 'center', letterSpacing: 12, fontSize: 22, fontFamily: 'DMSans-SemiBold' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 4, fontFamily: 'DMSans-Regular' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#1B6CA8', fontSize: 13, fontFamily: 'DMSans-Medium' },
  loginBtn: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: '#fff', fontSize: 15, fontFamily: 'DMSans-SemiBold', letterSpacing: 0.3 },
  bioBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: '#4A9FD4', backgroundColor: '#EBF4FF', marginBottom: 20 },
  bioIcon: { fontSize: 20 },
  bioBtnText: { color: '#1B6CA8', fontFamily: 'DMSans-SemiBold', fontSize: 14 },
  demoBox: { backgroundColor: '#EBF4FF', borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#C8E1F7' },
  demoTitle: { fontFamily: 'DMSans-SemiBold', fontSize: 11, color: '#1B6CA8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  demoRow: { fontFamily: 'DMSans-Regular', fontSize: 11, color: '#374151', marginBottom: 2 },
  demoRole: { fontFamily: 'DMSans-SemiBold' },
  demoPass: { fontFamily: 'DMSans-SemiBold', fontSize: 11, color: '#1B6CA8', marginTop: 6 },
  footer: { textAlign: 'center', color: '#9CA3AF', fontSize: 11, fontFamily: 'DMSans-Regular' },
});
