import type { LucideIcon } from 'lucide-react';

type Tone = 'default' | 'positive' | 'negative';

const VALUE_TONE: Record<Tone, string> = {
  default: 'text-ink',
  positive: 'text-success-text',
  negative: 'text-danger-text',
};

const ICON_TONE: Record<Tone, string> = {
  default: 'bg-ink/5 text-ink',
  positive: 'bg-success-bg text-success-text',
  negative: 'bg-danger-bg text-danger-text',
};

export default function StatCard({
  label,
  value,
  tone = 'default',
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: Tone;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${ICON_TONE[tone]}`}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}
      </div>
      <p className={`mt-3 text-2xl font-bold tabular-nums ${VALUE_TONE[tone]}`}>{value}</p>
    </div>
  );
}
