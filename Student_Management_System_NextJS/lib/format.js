const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const parseDay = (ymd) => {
  const [y, m, d] = String(ymd).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const dayName = (ymd) => (ymd ? DAYS[parseDay(ymd).getDay()] : '');
// "EEEE, MMMM d, yyyy"
export const longDate = (ymd) => {
  if (!ymd) return '';
  const d = parseDay(ymd);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
export const isoDay = (value) => {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toISOString().slice(0, 10);
};
export const todayIso = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const score = (v) => (v == null ? 'N/A' : Number(v).toFixed(2));
export const point = (v) => (v == null ? 'N/A' : Number(v).toFixed(1));
export const gpa = (v) => Number(v || 0).toFixed(2);
export const pct = (v) => `${Number(v || 0).toFixed(1)}%`;
export const dash = (v) => (v == null || v === '' ? '—' : v);

// Beacon tones — same mapping the JSPs used, in the Academia mockup palette.
export const gradeTone = (g) => ({ A: 'emerald', B: 'blue', C: 'teal', D: 'amber', F: 'rose' }[g] || 'slate');
export const statusTone = (s) =>
  ({ Excellent: 'emerald', 'Very Good': 'blue', Good: 'teal', Satisfactory: 'cyan', Poor: 'amber', Failing: 'rose' }[s] || 'slate');
export const attendanceTone = (s) => ({ Present: 'emerald', Late: 'amber', Absent: 'rose' }[s] || 'slate');

// Rate bars: >=90 green, >=75 blue, >=60 amber, else red (manage-attendance.jsp / view-attendance.jsp)
export const rateColor = (r) => (r >= 90 ? 'bg-[#52ce32]' : r >= 75 ? 'bg-blue-500' : r >= 60 ? 'bg-amber-500' : 'bg-rose-500');
export const rateLabel = (r) => (r >= 90 ? 'Excellent' : r >= 75 ? 'Good' : r >= 60 ? 'Needs Improvement' : 'Poor');
export const rateTone = (r) => (r >= 90 ? 'emerald' : r >= 75 ? 'blue' : r >= 60 ? 'amber' : 'rose');
