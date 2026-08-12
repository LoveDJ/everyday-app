/**
 * 获取本地日期字符串（YYYY-MM-DD），避免 toISOString() 的 UTC 时区偏移问题
 */
export function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
