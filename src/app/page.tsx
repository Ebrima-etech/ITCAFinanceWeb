'use client';

import { useAuth, isInternalRole } from '@/lib/auth-context';
import Link from 'next/link';
import { BarChart3, Eye, TrendingUp, DollarSign, Handshake, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { SkeletonCards } from '@/components/ui/Skeleton';
import type { DashboardSummary } from '@/lib/types';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getEventStatus(dateString: string): 'upcoming' | 'happening' | 'completed' {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate > today) return 'upcoming';
  if (eventDate.getTime() === today.getTime()) return 'happening';
  return 'completed';
}

export default function RootPage() {
  const { user } = useAuth();
  const isOfficer = !!user && isInternalRole(user.role);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<DashboardSummary>('/reports/public');
        setDashboard(data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Announcement Banner */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
              <p className="text-sm font-semibold">
                📢 Join us for the upcoming ITCA event! More details coming soon.
              </p>
            </div>
            <button
              onClick={() => setShowAnnouncement(false)}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 px-4 sm:px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600">ITCA</p>
              <p className="text-xs text-slate-600">Finance</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/partners"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Handshake className="h-4 w-4" strokeWidth={2} />
              Become Partner
            </Link>
            {isOfficer && (
              <Link
                href="/dashboard"
                className="hidden sm:block px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 sm:pb-20 px-4 sm:px-8 relative">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
            <Eye className="h-4 w-4 text-blue-600" strokeWidth={2} />
            <p className="text-xs sm:text-sm font-semibold text-blue-600 tracking-wide">
              COMPLETE FINANCIAL TRANSPARENCY
            </p>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-slate-900 tracking-tighter">
            Where ITCA's Money Goes
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-12">
            Real-time financial transparency. See every dalasi collected and spent.
          </p>
        </div>
      </section>

      {/* Financial Overview */}
      <section className="px-4 sm:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <SkeletonCards count={4} />
          ) : dashboard ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Total Income</p>
                    <TrendingUp className="h-4 w-4 text-green-600" strokeWidth={2} />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{formatMoney(dashboard.income)}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Total Expenses</p>
                    <DollarSign className="h-4 w-4 text-red-600" strokeWidth={2} />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{formatMoney(dashboard.expenses)}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Net Position</p>
                    <BarChart3 className="h-4 w-4 text-blue-600" strokeWidth={2} />
                  </div>
                  <p className={`text-3xl font-bold ${dashboard.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(dashboard.net)}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Year</p>
                    <Eye className="h-4 w-4 text-slate-400" strokeWidth={2} />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{dashboard.year}</p>
                </div>
              </div>

              {/* Events Summary */}
              {dashboard.events.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Events</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Event</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">Revenue</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.events.slice(0, 5).map((event) => (
                          <tr key={event.id} className="border-b border-slate-100">
                            <td className="py-3 px-4 text-slate-900 font-medium">{event.name}</td>
                            <td className="py-3 px-4 text-slate-600 text-xs">{formatDate(event.date)}</td>
                            <td className="py-3 px-4">
                              {(() => {
                                const status = getEventStatus(event.date);
                                return (
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    status === 'happening' ? 'bg-yellow-100 text-yellow-800' :
                                    status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                    'bg-slate-100 text-slate-800'
                                  }`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="py-3 px-4 text-right text-green-600 font-medium">{formatMoney(event.revenue)}</td>
                            <td className="py-3 px-4 text-right text-red-600 font-medium">{formatMoney(event.cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-600">No financial data available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust/Transparency Message */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-200 bg-blue-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Total Transparency
          </h2>
          <p className="text-slate-600 text-lg">
            Every member can see exactly where ITCA's dues and event revenue are allocated. No hidden costs.
            Complete accountability.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 sm:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            ITCA Financial Transparency · Updated in Real-Time
          </p>
        </div>
      </footer>
    </div>
  );
}
