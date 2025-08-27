// מנוע/מאסטר התקציב: טייפים + חישובים + עזרי פורמט

export type BudgetMode = 'ניצמד' | 'כיס אישי' | 'נרוויח';

export interface BudgetSettings {
  guestsMin: number;     // מינימום מוזמנים
  guestsMax: number;     // מקסימום מוזמנים
  guestsExact?: number;  // מספר מדויק (אופציונלי)
  giftAvg: number;       // מתנה ממוצעת לאורח (₪)
  savePercent: number;   // 5–30 (%), בשימוש ל"נרוויח"/"כיס אישי"
  mode: BudgetMode;      // יעד: ניצמד/כיס אישי/נרוויח
  personalPocket?: number; // כיס אישי (₪)
}

export type SupplierStatus = 'פתוח' | 'הצעה' | 'התחייב';

export interface Supplier {
  id: string;
  name: string;
  category: string;
  status: SupplierStatus;
  finalAmount?: number;  // סכום סופי שסוכם (₪)
  deposit?: number;      // מקדמה ששולמה (₪)
}

export interface BudgetSummary {
  guests: number;             // מספר האורחים לחישוב (מדויק או ממוצע הטווח)
  giftTotalLikely: number;    // סה"כ מתנות צפוי (guests × giftAvg)
  targetMin: number;          // יעד מינימום (≈85%)
  targetLikely: number;       // יעד סביר (לפי מצב היעד)
  targetMax: number;          // יעד מקסימום (≈115%)
  committedTotal: number;     // סה"כ התחייבויות ספקים
  committedPaid: number;      // מקדמות/שולם מתוך הסה"כ
  committedRemaining: number; // יתרה לתשלום
  varianceToLikely: number;   // פער מול יעד סביר (חיובי = מעל היעד)
  status: 'מתחת ליעד' | 'בתוך היעד' | 'מעל היעד';
}

export function normalizeGuests(s: BudgetSettings): number {
  if (s.guestsExact && s.guestsExact >= 1) return s.guestsExact;
  const avg = Math.round((s.guestsMin + s.guestsMax) / 2);
  return Math.max(1, avg);
}

export function computeTargets(s: BudgetSettings, guests: number) {
  const giftTotalLikely = guests * s.giftAvg;
  const saveRatio = clamp01(s.savePercent / 100); // ננרמל 0–1
  let targetLikely = giftTotalLikely;
  if (s.mode === 'נרוויח') targetLikely = Math.round(giftTotalLikely * (1 - saveRatio));
  if (s.mode === 'כיס אישי') targetLikely = Math.round(giftTotalLikely * (1 + saveRatio));
  const targetMin = Math.round(targetLikely * 0.85);
  const targetMax = Math.round(targetLikely * 1.15);
  return { giftTotalLikely, targetMin, targetLikely, targetMax };
}

export function committedOnly(list: Supplier[]): Supplier[] {
  return list.filter(s => s.status === 'התחייב');
}

export function calcBudget(settings: BudgetSettings, suppliers: Supplier[]): BudgetSummary {
  const guests = normalizeGuests(settings);
  const { giftTotalLikely, targetMin, targetLikely, targetMax } = computeTargets(settings, guests);

  const committed = committedOnly(suppliers);
  const committedTotal = committed.reduce((sum, s) => sum + (s.finalAmount || 0), 0);
  const committedPaid = committed.reduce((sum, s) => sum + (s.deposit || 0), 0);
  const committedRemaining = Math.max(0, committedTotal - committedPaid);

  const varianceToLikely = committedTotal - targetLikely;
  const status =
    committedTotal < targetMin ? 'מתחת ליעד' :
    committedTotal > targetMax ? 'מעל היעד' : 'בתוך היעד';

  return {
    guests,
    giftTotalLikely,
    targetMin,
    targetLikely,
    targetMax,
    committedTotal,
    committedPaid,
    committedRemaining,
    varianceToLikely,
    status,
  };
}

export function formatILS(n: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('he-IL').format(n);
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
} 