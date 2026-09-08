'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { inputClass, selectClass } from '@/lib/ui';
import type { EventSummary } from '@/lib/types';

export default function PartnersPage() {
  const [tab, setTab] = useState<'apply'>('apply');
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    logoUrl: '',
    description: '',
    sponsorshipLevel: 'bronze',
  });

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const data = await api.get<EventSummary[]>('/events');
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEvent) {
      setError('Please select an event');
      return;
    }

    setError(null);
    try {
      await api.post(`/events/${selectedEvent}/partners`, formData);
      setSubmitted(true);
      setFormData({
        organizationName: '',
        contactPerson: '',
        email: '',
        phone: '',
        website: '',
        logoUrl: '',
        description: '',
        sponsorshipLevel: 'bronze',
      });
      setSelectedEvent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600">ITCA</p>
              <p className="text-xs text-slate-600">Finance</p>
            </div>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-8 relative">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Sponsor an Event
          </h1>
          <p className="text-lg text-slate-600">
            Partner with ITCA to promote your brand at our upcoming events
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 sm:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Application Form */}
          <div className="max-w-2xl">
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" strokeWidth={2} />
                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    Application Submitted!
                  </h3>
                  <p className="text-green-700">
                    Thank you for your interest. We will review your sponsorship application and get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Event to Sponsor *
                    </label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className={selectClass}
                      required
                    >
                      <option value="">-- Select an Event --</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} ({event.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Organization Name"
                      required
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Contact Person"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="url"
                      placeholder="Website (optional)"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="url"
                      placeholder="Logo URL (optional)"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <textarea
                    placeholder="Tell us about your organization and why you want to sponsor this event"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sponsorship Level
                    </label>
                    <select
                      value={formData.sponsorshipLevel}
                      onChange={(e) => setFormData({ ...formData, sponsorshipLevel: e.target.value })}
                      className={selectClass}
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                    </select>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Submit Sponsorship Application
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    We will review your application within 3-5 business days
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 sm:px-8 mt-12 bg-white/50">
        <div className="max-w-6xl mx-auto text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
