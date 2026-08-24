type Tone = 'neutral' | 'success' | 'danger' | 'gold' | 'blue';

const TONES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  success: 'bg-success-bg text-success-text',
  danger: 'bg-danger-bg text-danger-text',
  gold: 'bg-gold/10 text-gold',
  blue: 'bg-chart-blue/10 text-chart-blue',
};

export default function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
