'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { inputClass, selectClass } from '@/lib/ui';

interface Partner {
  id: string;
  organizationName: string;
  logoUrl?: string;
  sponsorshipLevel: string;
}

export default function PartnersPage() {
  const [tab, setTab] = useState<'partners' | 'apply'>('partners');
  const [partners, setPartners] = useState<Partner[]>([]);
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
    async function loadPartners() {
      try {
        const data = await api.get<Partner[]>('/events/partners');
        setPartners(data);
      } catch (err) {
        console.error('Failed to load partners:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPartners();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/events/partners', formData);
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
      setTimeout(() => setTab('partners'), 3000);
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
            Event Sponsorships
          </h1>
          <p className="text-lg text-slate-600">
            Partner with ITCA to promote your brand at our events
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 sm:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 border-b border-slate-200 mb-8">
            <button
              onClick={() => {
                setTab('partners');
                setSubmitted(false);
              }}
              className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
                tab === 'partners'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Our Partners
            </button>
            <button
              onClick={() => setTab('apply')}
              className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
                tab === 'apply'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Apply as Partner
            </button>
          </div>

          {/* Partners List */}
          {tab === 'partners' && (
            <div>
              {loading ? (
                <p className="text-center text-slate-500">Loading partners...</p>
              ) : partners.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">No partners yet</p>
                  <button
                    onClick={() => setTab('apply')}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Be the first to apply
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {partners.map((partner) => (
                    <div key={partner.id} className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                      {partner.logoUrl && (
                        <img
                          src={partner.logoUrl}
                          alt={partner.organizationName}
                          className="h-24 w-24 mx-auto mb-4 object-contain"
                        />
                      )}
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {partner.organizationName}
                      </h3>
                      <p className="text-sm font-semibold text-blue-600 capitalize">
                        {partner.sponsorshipLevel} Partner
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Application Form */}
          {tab === 'apply' && (
            <div className="max-w-2xl">
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" strokeWidth={2} />
                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    Application Submitted!
                  </h3>
                  <p className="text-green-700">
                    Thank you for your interest. We will review your application and get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
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
                    placeholder="Tell us about your organization and why you want to partner with ITCA"
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
                    Submit Application
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    We will review your application within 3-5 business days
                  </p>
                </form>
              )}
            </div>
          )}
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
