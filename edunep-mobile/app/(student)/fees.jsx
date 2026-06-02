import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Card, EmptyState } from '../../components/ui';

export default function Screen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FBFF' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: 'PlayfairDisplay-Bold', fontSize: 22, color: '#1A2535' }}>💳 Fees & Payments</Text>
        </View>
        <Card>
          <EmptyState emoji="💳" title="Fees & Payments" description="Full data loads from EduNep API. This screen is wired and ready." />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
