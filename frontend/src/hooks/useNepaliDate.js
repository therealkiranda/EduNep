import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toDevanagari } from '@/utils/helpers';

const NEPALI_MONTHS_EN = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
const NEPALI_MONTHS_NE = ['बैशाख','जेठ','असार','श्रावण','भाद्र','आश्विन','कार्तिक','मंसिर','पौष','माघ','फाल्गुन','चैत्र'];

const BS_DATA = {
  2078: [31,31,32,31,31,31,30,29,30,29,30,30],
  2079: [31,31,32,31,31,31,30,29,30,29,30,30],
  2080: [31,32,31,32,31,30,30,30,29,29,30,31],
  2081: [31,32,31,32,31,30,30,30,29,30,29,31],
  2082: [31,31,32,31,31,31,30,29,30,29,30,30],
  2083: [31,31,32,31,31,31,30,29,30,29,30,30],
  2084: [31,32,31,32,31,30,30,30,29,29,30,31],
  2085: [31,32,31,32,31,30,30,30,29,30,29,31],
  2086: [31,31,31,32,31,31,30,29,30,29,30,30],
};

// Verified: 1 Baisakh 2083 BS = 14 May 2026 AD
const AD_REF = new Date(Date.UTC(2026, 4, 14));
const BS_REF = { year: 2083, month: 1, day: 1 };

function adToBs(adDateStr) {
  try {
    const parts = adDateStr.split('T')[0].split('-');
    const adUTC = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    let diff = Math.round((adUTC - AD_REF) / 86400000);

    let { year, month, day } = { ...BS_REF };
    let monthData = BS_DATA[year] || BS_DATA[2083];

    if (diff === 0) return { year, month, day };

    if (diff > 0) {
      let daysLeft = monthData[month - 1] - day + 1;
      while (diff > 0) {
        if (diff < daysLeft) {
          day += diff;
          diff = 0;
        } else {
          diff -= daysLeft;
          month++;
          day = 1;
          if (month > 12) { month = 1; year++; }
          monthData = BS_DATA[year] || BS_DATA[2083];
          daysLeft = monthData[month - 1];
        }
      }
    } else {
      diff = Math.abs(diff);
      while (diff > 0) {
        if (diff < day) {
          day -= diff;
          diff = 0;
        } else {
          diff -= day;
          month--;
          if (month < 1) { month = 12; year--; }
          monthData = BS_DATA[year] || BS_DATA[2083];
          day = monthData[month - 1];
        }
      }
    }

    return { year, month, day };
  } catch { return null; }
}

export function useNepaliDate() {
  const { i18n } = useTranslation();
  const isNepali = i18n.language === 'ne';

  const convert = useCallback((adDateStr) => adToBs(adDateStr), []);

  const format = useCallback((adDateStr, devanagari = false) => {
    const bs = adToBs(adDateStr);
    if (!bs) return adDateStr || '—';
    const useDevanagari = devanagari || isNepali;
    const months = useDevanagari ? NEPALI_MONTHS_NE : NEPALI_MONTHS_EN;
    const d = useDevanagari ? toDevanagari(bs.day)  : bs.day;
    const y = useDevanagari ? toDevanagari(bs.year) : bs.year;
    return `${y} ${months[bs.month - 1]} ${d}`;
  }, [isNepali]);

  const formatBoth = useCallback((adDateStr) => {
    const bs = adToBs(adDateStr);
    if (!bs) return adDateStr || '—';
    const adFormatted = new Date(adDateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const bsFormatted = `${bs.year} ${NEPALI_MONTHS_EN[bs.month - 1]} ${bs.day} BS`;
    return {
      ad:   adFormatted,
      bs:   bsFormatted,
      bsNe: `${toDevanagari(bs.year)} ${NEPALI_MONTHS_NE[bs.month - 1]} ${toDevanagari(bs.day)}`,
    };
  }, []);

  const today = useCallback(() => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    return adToBs(iso);
  }, []);

  const todayFormatted = useCallback(() => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    return format(iso);
  }, [format]);

  return { convert, format, formatBoth, today, todayFormatted, isNepali };
}
