import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

const en = {
  translation: {
    dashboard: 'Dashboard', students: 'Students', staff: 'Staff',
    attendance: 'Attendance', assignments: 'Assignments', grades: 'Grades',
    fees: 'Fees', messages: 'Messages', announcements: 'Announcements',
    calendar: 'Calendar', settings: 'Settings', logout: 'Logout',
    profile: 'Profile', sign_in: 'Sign In', email_address: 'Email Address',
    password: 'Password', forgot_password: 'Forgot Password?',
    two_factor: 'Enter 2FA Code', loading: 'Loading...',
    total_students: 'Total Students', total_staff: 'Total Staff',
    today_attendance: "Today's Attendance", fees_this_month: 'Fees This Month',
    welcome_back: 'Welcome back', present: 'Present', absent: 'Absent',
    late: 'Late', submitted: 'Submitted', graded: 'Graded', paid: 'Paid',
    unpaid: 'Unpaid', active: 'Active', inactive: 'Inactive',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    search: 'Search', filter: 'Filter', export: 'Export',
    no_data: 'No data found.', view_all: 'View All',
  }
};

const ne = {
  translation: {
    dashboard: 'ड्यासबोर्ड', students: 'विद्यार्थीहरू', staff: 'कर्मचारीहरू',
    attendance: 'उपस्थिति', assignments: 'कार्यहरू', grades: 'ग्रेडहरू',
    fees: 'शुल्क', messages: 'सन्देशहरू', announcements: 'सूचनाहरू',
    calendar: 'पात्रो', settings: 'सेटिङ', logout: 'लगआउट',
    profile: 'प्रोफाइल', sign_in: 'साइन इन', email_address: 'इमेल ठेगाना',
    password: 'पासवर्ड', forgot_password: 'पासवर्ड बिर्सनुभयो?',
    two_factor: 'OTP कोड हाल्नुहोस्', loading: 'लोड हुँदैछ...',
    total_students: 'कुल विद्यार्थी', total_staff: 'कुल कर्मचारी',
    today_attendance: 'आजको उपस्थिति', fees_this_month: 'यो महिनाको शुल्क',
    welcome_back: 'फेरि स्वागत छ', present: 'उपस्थित', absent: 'अनुपस्थित',
    late: 'ढिलो', submitted: 'पेश भयो', graded: 'ग्रेड भयो', paid: 'तिरिसकेको',
    unpaid: 'बाँकी', active: 'सक्रिय', inactive: 'निष्क्रिय',
    save: 'सुरक्षित', cancel: 'रद्द', delete: 'मेट्नुहोस्', edit: 'सम्पादन',
    search: 'खोज्नुहोस्', filter: 'फिल्टर', export: 'निर्यात',
    no_data: 'कुनै डाटा भेटिएन।', view_all: 'सबै हेर्नुहोस्',
  }
};

const deviceLang = getLocales()[0]?.languageCode || 'en';

i18n.use(initReactI18next).init({
  resources:     { en, ne },
  lng:           ['en','ne'].includes(deviceLang) ? deviceLang : 'en',
  fallbackLng:   'en',
  interpolation: { escapeValue: false },
});

export default i18n;
