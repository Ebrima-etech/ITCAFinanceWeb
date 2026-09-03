'use client';

import { useAuth, isInternalRole } from '@/lib/auth-context';
import Link from 'next/link';
import { TrendingUp, Lock, BarChart3, Zap } from 'lucide-react';

export default function RootPage() {
  const { user } = useAuth();
  const isOfficer = !!user && isInternalRole(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-slate-950 font-bold" strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-gold">ITCA</p>
                <p className="text-xs text-slate-400">Finance</p>
              </div>
            </div>
            {isOfficer && (
              <Link
                href="/dashboard"
                className="px-5 py-2 rounded-lg bg-gold text-slate-950 text-sm font-semibold hover:bg-gold/90 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          </div>

          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-6">
              <Zap className="h-4 w-4 text-gold" strokeWidth={2} />
              <span className="text-xs font-semibold text-gold">Financial Transparency</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Every Dalasi,<br />
              <span className="bg-gradient-to-r from-gold via-gold to-gold/60 bg-clip-text text-transparent">
                Accounted For
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Professional financial management for ITCA. Track dues, events, budgets, and spending
              with institutional-grade transparency and control.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:border-gold/30 transition-colors">
                <div className="mb-3 inline-block p-3 bg-gold/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-gold" strokeWidth={2} />
                </div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total Managed</p>
                <p className="text-3xl font-bold text-white">D0.00</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:border-gold/30 transition-colors">
                <div className="mb-3 inline-block p-3 bg-gold/10 rounded-lg">
                  <Lock className="h-6 w-6 text-gold" strokeWidth={2} />
                </div>
                <p className="text-slate-400 text-sm font-medium mb-2">Secure & Audited</p>
                <p className="text-3xl font-bold text-white">100%</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:border-gold/30 transition-colors">
                <div className="mb-3 inline-block p-3 bg-gold/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-gold" strokeWidth={2} />
                </div>
                <p className="text-slate-400 text-sm font-medium mb-2">Real-time Reporting</p>
                <p className="text-3xl font-bold text-white">Live</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Built for Financial Excellence
            </h2>
            <p className="text-lg text-slate-400">
              Comprehensive tools for modern financial management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Complete Ledger',
                description: 'Every transaction recorded. Full audit trail. Zero discrepancies.',
                icon: '📊',
              },
              {
                title: 'Event Tracking',
                description: 'Manage revenue and costs per event with precise profit calculations.',
                icon: '📅',
              },
              {
                title: 'Budget Planning',
                description: 'Plan ahead with variance analysis and year-over-year comparisons.',
                icon: '💰',
              },
              {
                title: 'Membership Dues',
                description: 'Track payments by member, method, and date with automated reporting.',
                icon: '👥',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 hover:border-gold/30 hover:bg-slate-800/50 transition-all duration-300"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-gold/10 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-gold/20 rounded-3xl p-12 text-center backdrop-blur-sm">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to take control?
              </h3>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Join ITCA's modern financial management platform. Get started with full visibility
                into your organization's finances.
              </p>
              {isOfficer ? (
                <Link
                  href="/dashboard"
                  className="inline-block px-8 py-4 rounded-lg bg-gold text-slate-950 font-bold hover:bg-gold/90 transition-colors"
                >
                  Access Dashboard
                </Link>
              ) : (
                <p className="text-slate-400">Sign in with your officer account to access the dashboard.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-slate-950" strokeWidth={3} />
              </div>
              <span className="font-bold text-white">ITCA Finance</span>
            </div>
            <p className="text-sm text-slate-500">
              University of The Gambia · Financial Management Excellence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
