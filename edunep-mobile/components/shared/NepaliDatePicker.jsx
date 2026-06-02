import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { useNepaliDate } from '../../hooks/useNepaliDate';
import { NEPALI_MONTHS } from '../../utils/helpers';

const BS_DAYS = ['आइत','सोम','मंगल','बुध','बिही','शुक्र','शनि'];

export default function NepaliDatePicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const { adToBs, isNe } = useNepaliDate();
  const bs = value ? adToBs(value) : null;

  return (
    <View>
      {label && <Text style={s.label}>{label}</Text>}
      <TouchableOpacity onPress={() => setOpen(true)} style={s.trigger}>
        <Text style={s.triggerText}>
          {bs ? `${bs.year} ${NEPALI_MONTHS[bs.month-1]} ${bs.day} BS` : 'Select date (BS)'}
        </Text>
        <Text>📅</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Select BS Date</Text>
              <TouchableOpacity onPress={() => setOpen(false)}><Text style={s.close}>✕</Text></TouchableOpacity>
            </View>
            <View style={s.calRow}>
              {BS_DAYS.map(d => <Text key={d} style={s.dayLabel}>{d}</Text>)}
            </View>
            <Text style={s.note}>Full BS date picker — connect to NepaliDateService for complete grid rendering.</Text>
            <TouchableOpacity style={s.doneBtn} onPress={() => setOpen(false)}>
              <Text style={s.doneTxt}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  label:       { fontFamily: 'DMSans-Medium', fontSize: 13, color: '#374151', marginBottom: 6 },
  trigger:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13 },
  triggerText: { fontFamily: 'DMSans-Regular', fontSize: 14, color: '#1A2535' },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle:  { fontFamily: 'DMSans-SemiBold', fontSize: 16, color: '#1A2535' },
  close:       { fontSize: 18, color: '#6B7A8D' },
  calRow:      { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  dayLabel:    { fontFamily: 'NotoSansDevanagari', fontSize: 12, color: '#1B6CA8', fontWeight: 'bold' },
  note:        { fontFamily: 'DMSans-Regular', fontSize: 12, color: '#6B7A8D', textAlign: 'center', marginVertical: 16 },
  doneBtn:     { backgroundColor: '#1B6CA8', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  doneTxt:     { color: '#fff', fontFamily: 'DMSans-SemiBold', fontSize: 14 },
});
