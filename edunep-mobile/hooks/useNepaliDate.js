import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const BS_DATA = {
  2080: [31,32,31,32,31,30,30,30,29,29,30,31],
  2081: [31,32,31,32,31,30,30,30,29,30,29,31],
  2082: [31,31,32,31,31,31,30,29,30,29,30,30],
  2083: [31,31,32,31,31,31,30,29,30,29,30,30],
  2084: [31,32,31,32,31,30,30,30,29,29,30,31],
};
const MONTHS_EN = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
const MONTHS_NE = ['बैशाख','जेठ','असार','श्रावण','भाद्र','आश्विन','कार्तिक','मंसिर','पौष','माघ','फाल्गुन','चैत्र'];

function toDevanagari(n) {
  const map = { '0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६','7':'७','8':'८','9':'९' };
  return String(n).replace(/[0-9]/g, d => map[d]);
}

function adToBs(adStr) {
  try {
    const ad  = new Date(adStr);
    const ref = new Date('1944-01-01');
    let diff  = Math.floor((ad - ref) / 86400000);
    let year = 2000, month = 9, day = 17;
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
  const isNe = i18n.language === 'ne';

  const format = useCallback((adStr) => {
    const bs = adToBs(adStr);
    if (!bs) return adStr || '—';
    if (isNe) return `${toDevanagari(bs.year)} ${MONTHS_NE[bs.month-1]} ${toDevanagari(bs.day)}`;
    return `${bs.year} ${MONTHS_EN[bs.month-1]} ${bs.day} BS`;
  }, [isNe]);

  const today = useCallback(() => {
    const t = adToBs(new Date().toISOString().split('T')[0]);
    if (!t) return '';
    if (isNe) return `${toDevanagari(t.year)} ${MONTHS_NE[t.month-1]} ${toDevanagari(t.day)}`;
    return `${t.year} ${MONTHS_EN[t.month-1]} ${t.day} BS`;
  }, [isNe]);

  return { format, today, adToBs, isNe };
}
