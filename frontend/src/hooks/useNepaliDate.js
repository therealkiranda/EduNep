import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toDevanagari, NEPALI_MONTHS_EN, NEPALI_MONTHS_NE } from '@/utils/helpers';

// BS year data (days per month)
const BS_DATA = {
  2078: [31,31,32,31,31,31,30,29,30,29,30,30],
  2079: [31,31,32,31,31,31,30,29,30,29,30,30],
  2080: [31,32,31,32,31,30,30,30,29,29,30,31],
  2081: [31,32,31,32,31,30,30,30,29,30,29,31],
  2082: [31,31,32,31,31,31,30,29,30,29,30,30],
  2083: [31,31,32,31,31,31,30,29,30,29,30,30],
  2084: [31,32,31,32,31,30,30,30,29,29,30,31],
  2085: [31,32,31,32,31,30,30,30,29,30,29,31],
};
const AD_EPOCH = '1944-01-01';
const BS_EPOCH = { year: 2000, month: 9, day: 17 };

function adToBs(adDateStr) {
  try {
    const ad  = new Date(adDateStr);
    const ref = new Date(AD_EPOCH);
    let diff  = Math.floor((ad - ref) / 86400000);

    let { year, month, day } = BS_EPOCH;
    while (diff > 0) {
      const monthData = BS_DATA[year] || BS_DATA[2082];
      const dim = monthData[month - 1];
      if (diff >= dim) { diff -= dim; month++; if (month > 12) { month = 1; year++; } }
      else { day += diff; diff = 0; }
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
    const d = useDevanagari ? toDevanagari(bs.day)   : bs.day;
    const y = useDevanagari ? toDevanagari(bs.year)  : bs.year;
    return `${y} ${months[bs.month - 1]} ${d}`;
  }, [isNepali]);

  const formatBoth = useCallback((adDateStr) => {
    const bs = adToBs(adDateStr);
    if (!bs) return adDateStr || '—';
    const adFormatted = new Date(adDateStr).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
    const bsFormatted = `${bs.year} ${NEPALI_MONTHS_EN[bs.month - 1]} ${bs.day} BS`;
    return { ad: adFormatted, bs: bsFormatted, bsNe: `${toDevanagari(bs.year)} ${NEPALI_MONTHS_NE[bs.month - 1]} ${toDevanagari(bs.day)}` };
  }, []);

  const today = useCallback(() => {
    return adToBs(new Date().toISOString().split('T')[0]);
  }, []);

  const todayFormatted = useCallback(() => {
    return format(new Date().toISOString().split('T')[0]);
  }, [format]);

  return { convert, format, formatBoth, today, todayFormatted, isNepali };
}
