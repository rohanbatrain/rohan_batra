export function formatMinutes(total?: number | null): string {
  if (!total || total <= 0) return '—';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function truncate(text?: string | null, max = 100): string {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}
