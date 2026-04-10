// frontend/src/app/(dashboard)/seller/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, ShoppingCart, DollarSign, Star,
  Plus, Eye, Edit2, TrendingUp, Wallet,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';

export default function SellerDashboard() {
  const { user, refreshUser } = useAuthStore();
  const [orders, setOrders]     = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats]       = useState({ totalRevenue: 0, totalOrders: 0, avgRating: 0, totalSales: 0 });
  const [tab, setTab] = useState<'orders' | 'listings'>('orders');

  useEffect(() => {
    Promise.all([
      api.get('/api/orders/selling?limit=10'),
      api.get('/api/products?sellerId=me&limit=10'),
    ]).then(([o, p]: any) => {
      setOrders(o.items);
      setProducts(p.items);
      // Compute stats from orders
      const completed = o.items.filter((x: any) => x.status === 'completed');
      setStats({
        totalRevenue: completed.reduce((s: number, x: any) => s + x.amount * 0.95, 0),
        totalOrders: o.total,
        avgRating: user?.rating || 0,
        totalSales: user?.totalSales || 0,
      });
    });
    refreshUser();
  }, []);

  const statusColors: Record<string, string> = {
    pending:   'bg-gray-500/20 text-gray-400',
    paid:      'bg-blue-500/20 text-blue-400',
    delivered: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-green-500/20 text-green-400',
    disputed:  'bg-red-500/20 text-red-400',
    refunded:  'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.name}</p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <Wallet className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-green-400">${(user?.walletBalance || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-400">Wallet Balance</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <DollarSign className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-400">Total Earned</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <ShoppingCart className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
          <p className="text-sm text-gray-400">Total Orders</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <TrendingUp className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-2xl font-bold">{stats.totalSales}</p>
          <p className="text-sm text-gray-400">Items Sold</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <Star className="w-5 h-5 text-yellow-400 mb-2" />
          <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
          <p className="text-sm text-gray-400">Avg Rating</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['orders', 'listings'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg capitalize transition-all
              ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400">Order ID</th>
                <th className="text-left px-4 py-3 text-gray-400">Product</th>
                <th className="text-left px-4 py-3 text-gray-400">Buyer</th>
                <th className="text-left px-4 py-3 text-gray-400">Amount</th>
                <th className="text-left px-4 py-3 text-gray-400">Status</th>
                <th className="text-right px-4 py-3 text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{order.product?.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{order.buyer?.name}</td>
                  <td className="px-4 py-3 text-blue-400 font-medium">${order.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {order.status === 'paid' && (
                      <button
                        onClick={async () => {
                          await api.post(`/api/orders/${order.id}/deliver`, {
                            deliveryData: { note: 'Delivered via platform' },
                          });
                          window.location.reload();
                        }}
                        className="text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30 px-3 py-1 rounded transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <span className="text-xs text-gray-500">Completed ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Listings Tab */}
      {tab === 'listings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium line-clamp-2 flex-1">{p.title}</h3>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded capitalize ${
                  p.status === 'active'   ? 'bg-green-500/20 text-green-400' :
                  p.status === 'pending'  ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-700 text-gray-400'
                }`}>{p.status}</span>
              </div>
              <p className="text-blue-400 font-bold mb-3">${p.price.toFixed(2)}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                <span><Eye className="w-3.5 h-3.5 inline mr-1" />{p.totalSold} sold</span>
                <span><Star className="w-3.5 h-3.5 inline mr-1 text-yellow-400" />{p.rating.toFixed(1)}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/products/${p.id}`}
                  className="flex-1 text-center text-xs bg-gray-800 hover:bg-gray-700 py-2 rounded-lg transition-colors"
                >
                  View
                </Link>
                <Link
                  href={`/products/${p.id}/edit`}
                  className="flex-1 text-center text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 py-2 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 inline mr-1" />Edit
                </Link>
              </div>
            </div>
          ))}
          {/* New Listing Card */}
          <Link
            href="/products/new"
            className="bg-gray-900 rounded-xl p-4 border border-dashed border-gray-700 hover:border-blue-500
              flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-400 transition-all min-h-40"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm">Add New Listing</span>
          </Link>
        </div>
      )}
    </div>
  );
}
