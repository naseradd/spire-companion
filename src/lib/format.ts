export function num(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('fr-FR');
}
export function compact(n: number | null | undefined): string {
  if (n == null) return '—';
  const a = Math.abs(n);
  if (a >= 1_000_000) return +(n / 1_000_000).toFixed(1) + 'M';
  if (a >= 1_000) return +(n / 1_000).toFixed(1) + 'k';
  return String(Math.round(n));
}
export function pct(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toFixed(1) + '%';
}
export function dateFr(iso: string | null | undefined): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return iso; }
}
export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s);
