import { Check } from 'lucide-react';

const HIGHLIGHTS = [
  'Every due, gift, and event cost in one ledger',
  'A full audit trail of who did what, and when',
  'Nothing lost when officers change over',
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 85% 15%, rgba(201,150,44,0.18), transparent 45%), radial-gradient(circle at 10% 90%, rgba(201,150,44,0.10), transparent 40%)',
          }}
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">UTG ITCA</p>
          <p className="mt-1 text-lg font-semibold">Account Management</p>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">
            One place ITCA&apos;s money is tracked, start to finish.
          </h2>
          <ul className="mt-6 space-y-3">
            {HIGHLIGHTS.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-white/80">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold/20">
                  <Check className="h-2.5 w-2.5 text-gold" strokeWidth={3} />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">University of The Gambia &middot; ITCA</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-4 py-12 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
