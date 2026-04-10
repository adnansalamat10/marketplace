// frontend/src/app/(dashboard)/wallet/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const TOP_UP_AMOUNTS = [10, 25, 50, 100, 200, 500];

interface Transaction {
  id: string; type: string; amount: number;
  description: string; createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/payments/transactions').then((d: any) => setTransactions(d));
    refreshUser();
  }, []);

  const handleTopUp = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount < 5) { toast.error('Minimum top-up is $5'); return; }
    setLoading(true);
    try {
      const data: any = await api.post('/api/payments/wallet/topup', { amount });
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err?.message || 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  const txTypeConfig: Record<string, { label: string; color: string; icon: any }> = {
    topup:     { label: 'Top-up',       color: 'text-green-400',  icon: Plus },
    purchase:  { label: 'Purchase',     color: 'text-red-400',    icon: ArrowUpRight },
    sale:      { label: 'Sale',         color: 'text-green-400',  icon: ArrowDownLeft },
    refund:    { label: 'Refund',       color: 'text-blue-400',   icon: RefreshCw },
    affiliate: { label: 'Affiliate',    color: 'text-purple-400', icon: Plus },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-8">Wallet</h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-6 border border-blue-500/20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600/30 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Available Balance</p>
              <p className="text-4xl font-bold">${(user?.walletBalance || 0).toFixed(2)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Use your wallet balance to pay for orders instantly with no fees
          </p>
        </div>

        {/* Top-up */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
          <h2 className="font-semibold mb-4">Top Up Wallet</h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {TOP_UP_AMOUNTS.map(amount => (
              <button key={amount} type="button"
                onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                className={`py-3 rounded-xl border text-sm font-medium transition-all
                  ${selectedAmount === amount
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                ${amount}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1.5">Custom Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                placeholder="Enter amount"
                min="5"
                className="w-full bg-gray-800 text-white pl-8 pr-4 py-3 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
              />
            </div>
          </div>

          <button onClick={handleTopUp} disabled={loading || (!selectedAmount && !customAmount)}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
            {loading ? 'Redirecting...' : `Top Up $${selectedAmount || customAmount || '0'}`}
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold">Transaction History</h2>
          </div>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">No transactions yet</p>
          ) : (
            <div>
              {transactions.map(tx => {
                const config = txTypeConfig[tx.type] || txTypeConfig.purchase;
                const Icon = config.icon;
                const isCredit = tx.amount > 0;
                return (
                  <div key={tx.id}
                    className="flex items-center gap-4 px-5 py-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                      ${isCredit ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <Icon className={`w-4 h-4 ${isCredit ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-gray-500">
                        {config.label} · {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`font-semibold shrink-0 ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                      {isCredit ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
