export function formatMoney(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return `D${formatted}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function typeLabel(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

const INFLOW_TYPES = new Set(['DUE', 'EVENT_REVENUE', 'GIFT', 'OTHER_INCOME']);

// Mirrors the backend's is_inflow - used to color-code transaction types
// consistently with the dashboard's income (blue) / expense (orange) chart.
export function isInflowType(type: string): boolean {
  return INFLOW_TYPES.has(type);
}
