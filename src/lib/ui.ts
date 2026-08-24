// Shared className strings for native form elements, kept as plain
// constants (not wrapper components) so every page's existing
// controlled-input plumbing keeps working unchanged.
export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ' +
  'transition placeholder:text-slate-400 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10';

export const selectClass = inputClass;

export const labelClass = 'block text-xs font-medium text-slate-500';

export const thClass = 'px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500';
export const tdClass = 'px-5 py-3.5 text-sm';
export const trClass = 'border-t border-slate-100 transition-colors hover:bg-slate-50/80';
