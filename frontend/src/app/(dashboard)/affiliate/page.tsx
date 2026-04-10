// frontend/src/app/(dashboard)/affiliate/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Copy, Users, DollarSign, Link as LinkIcon, Check } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface AffiliateStats {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  referralLink: string;
}

export default function AffiliatePage() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  useEffect(() => {
    api.get('/api/users/affiliate/stats').then((d: any) => setStats(d));
  }, []);

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success('Copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  if (!stats) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-2">Affiliate Program</h1>
        <p className="text-gray-400 mb-8">Earn 2% commission on every order from users you refer</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <Users className="w-6 h-6 text-blue-400 mb-3" />
            <p className="text-3xl font-bold">{stats.totalReferrals}</p>
            <p className="text-gray-400 text-sm mt-1">Total Referrals</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <DollarSign className="w-6 h-6 text-green-400 mb-3" />
            <p className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-1">Total Earned</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-blue-400" /> Your Referral Link
          </h2>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 truncate">
              {stats.referralLink}
            </div>
            <button
              onClick={() => copyToClipboard(stats.referralLink, 'link')}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl transition-colors flex items-center gap-2 shrink-0 text-sm"
            >
              {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy
            </button>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
          <h2 className="font-semibold mb-4">Your Referral Code</h2>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-800 rounded-xl px-4 py-3 text-2xl font-mono font-bold tracking-widest text-center text-blue-400">
              {stats.referralCode || 'N/A'}
            </div>
            {stats.referralCode && (
              <button
                onClick={() => copyToClipboard(stats.referralCode, 'code')}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl transition-colors flex items-center gap-2 shrink-0 text-sm"
              >
                {copied === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy
              </button>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h2 className="font-semibold mb-4 text-blue-300">How It Works</h2>
          <div className="space-y-3 text-sm text-gray-300">
            {[
              'Share your referral link or code with friends',
              'They sign up and make their first purchase',
              'You earn 2% of every order they place — forever',
              'Earnings are credited to your wallet automatically',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-600/30 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
