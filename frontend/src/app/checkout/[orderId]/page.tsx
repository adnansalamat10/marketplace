// frontend/src/app/checkout/[orderId]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Shield, Wallet, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [method, setMethod] = useState<'stripe' | 'paypal' | 'wallet'>('stripe');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/api/orders/${orderId}`).then((data: any) => setOrder(data));
  }, [orderId]);

  const handlePay = async () => {
    setLoading(true);
    try {
      if (method === 'stripe') {
        const data: any = await api.post('/api/payments/stripe/checkout', { orderId });
        window.location.href = data.url;

      } else if (method === 'paypal') {
        const data: any = await api.post('/api/payments/paypal/order', { orderId });
        // Redirect to PayPal approval URL
        const approvalUrl = data.links?.find((l: any) => l.rel === 'approve')?.href;
        if (approvalUrl) window.location.href = approvalUrl;

      } else if (method === 'wallet') {
        if (user!.walletBalance! < order.amount) {
          toast.error('Insufficient wallet balance');
          return;
        }
        await api.post('/api/payments/wallet/pay', { orderId });
        await refreshUser();
        toast.success('Payment successful!');
        router.push(`/orders/${orderId}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div className="min-h-screen bg-gray-950 animate-pulse" />;

  const walletShortfall = Math.max(0, order.amount - (user?.walletBalance || 0));

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Complete Your Order</h1>

        {/* Order Summary */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-5 border border-gray-800">
          <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Order Summary</h2>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">{order.product?.title}</p>
              <p className="text-sm text-gray-400">Seller: {order.seller?.name}</p>
            </div>
            <p className="text-xl font-bold text-blue-400">${order.amount.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 px-3 py-2 rounded-lg">
            <Shield className="w-4 h-4" />
            Protected by Escrow — funds held until delivery confirmed
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-5 border border-gray-800">
          <h2 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Payment Method</h2>

          {/* Stripe */}
          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer mb-3 transition-all
            ${method === 'stripe' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
            <input type="radio" name="method" value="stripe"
              checked={method === 'stripe'} onChange={() => setMethod('stripe')} className="accent-blue-500" />
            <CreditCard className="w-5 h-5 text-blue-400" />
            <div>
              <p className="font-medium">Credit / Debit Card</p>
              <p className="text-xs text-gray-400">Visa, Mastercard, Amex — Powered by Stripe</p>
            </div>
          </label>

          {/* PayPal */}
          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer mb-3 transition-all
            ${method === 'paypal' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
            <input type="radio" name="method" value="paypal"
              checked={method === 'paypal'} onChange={() => setMethod('paypal')} className="accent-blue-500" />
            <span className="text-blue-400 font-bold text-lg">P</span>
            <div>
              <p className="font-medium">PayPal</p>
              <p className="text-xs text-gray-400">Pay with your PayPal account</p>
            </div>
          </label>

          {/* Wallet */}
          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
            ${method === 'wallet' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
            <input type="radio" name="method" value="wallet"
              checked={method === 'wallet'} onChange={() => setMethod('wallet')} className="accent-blue-500" />
            <Wallet className="w-5 h-5 text-green-400" />
            <div className="flex-1">
              <p className="font-medium">Wallet Balance</p>
              <p className="text-xs text-gray-400">
                Available: <span className="text-green-400">${(user?.walletBalance || 0).toFixed(2)}</span>
                {walletShortfall > 0 && (
                  <span className="text-red-400 ml-2">— Need ${walletShortfall.toFixed(2)} more</span>
                )}
              </p>
            </div>
          </label>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading || (method === 'wallet' && walletShortfall > 0)}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-semibold py-4 rounded-xl transition-all text-lg"
        >
          {loading ? 'Processing...' : `Pay $${order.amount.toFixed(2)}`}
        </button>

        {method === 'wallet' && walletShortfall > 0 && (
          <button
            onClick={() => router.push('/wallet/topup')}
            className="w-full mt-3 border border-gray-600 hover:border-gray-500 text-gray-300
              py-3 rounded-xl transition-all"
          >
            Top Up Wallet +${walletShortfall.toFixed(2)}
          </button>
        )}

        <p className="text-center text-gray-500 text-xs mt-4">
          🔒 All payments secured with 256-bit SSL encryption
        </p>
      </div>
    </main>
  );
}
