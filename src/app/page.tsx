'use client';

import { useAuth, isInternalRole } from '@/lib/auth-context';
import Link from 'next/link';
import { BarChart3, ChevronDown } from 'lucide-react';

export default function RootPage() {
  const { user } = useAuth();
  const isOfficer = !!user && isInternalRole(user.role);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-sm border border-white/40" />
            <span className="text-sm font-semibold tracking-tight">ITCA Finance</span>
          </div>
          <div className="flex items-center gap-8">
            {isOfficer && (
              <Link
                href="/dashboard"
                className="px-5 py-2 rounded-md bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center px-6 sm:px-8 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 right-0 w-1/3 h-1/3 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-1/4 h-1/4 bg-gold/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl text-center">
          {/* Subtitle Badge */}
          <div className="inline-block mb-8">
            <p className="text-xs sm:text-sm font-mono text-white/50 tracking-wide">
              FINANCIAL MANAGEMENT PLATFORM
            </p>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-tight mb-8 tracking-tighter">
            Every Dalasi,
            <br />
            <span className="text-white/40">Accounted For.</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12">
            Professional financial management for ITCA. Complete transparency on dues, events,
            budgets, and spending. Built for institutional excellence.
          </p>

          {/* Stats Grid - Minimalist Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px mb-16 bg-white/10 rounded-lg overflow-hidden max-w-2xl mx-auto">
            <div className="bg-black px-8 py-8 text-center">
              <p className="text-white/50 text-xs font-mono mb-3">TOTAL MANAGED</p>
              <p className="text-4xl font-bold">D0.00</p>
            </div>
            <div className="bg-black px-8 py-8 text-center border-l border-r border-white/10">
              <p className="text-white/50 text-xs font-mono mb-3">SECURITY LEVEL</p>
              <p className="text-4xl font-bold">100%</p>
            </div>
            <div className="bg-black px-8 py-8 text-center">
              <p className="text-white/50 text-xs font-mono mb-3">REAL-TIME AUDIT</p>
              <p className="text-4xl font-bold">Live</p>
            </div>
          </div>

          {/* Enhanced CTA */}
          {isOfficer ? (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 rounded-md bg-white text-black font-semibold hover:bg-white/90 transition-colors"
            >
              Access Dashboard
            </Link>
          ) : (
            <p className="text-white/40 text-sm">Sign in as an officer to access the dashboard</p>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-5 w-5 text-white/40" strokeWidth={1.5} />
        </div>
      </section>

    </div>
  );
}
