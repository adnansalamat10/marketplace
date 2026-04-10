// frontend/src/app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  Users, Package, ShoppingCart, DollarSign,
  AlertTriangle, Clock, TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Analytics {
  totalUsers: number; totalSellers: number; totalProducts: number;
  totalOrders: number; totalRevenue: number; pendingKYC: number; openDisputes: number;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'disputes' | 'kyc'>('overview');

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/analytics'),
      api.get('/api/admin/analytics/revenue'),
    ]).then(([a, r]: any) => {
      setAnalytics(a);
      setRevenueData(r);
    });
  }, []);

  const stats = analytics ? [
    { label: 'Total Users',      value: analytics.totalUsers.toLocaleString(),   icon: Users,         color: 'blue' },
    { label: 'Total Sellers',    value: analytics.totalSellers.toLocaleString(),  icon: Users,         color: 'purple' },
    { label: 'Active Products',  value: analytics.totalProducts.toLocaleString(), icon: Package,       color: 'green' },
    { label: 'Total Orders',     value: analytics.totalOrders.toLocaleString(),   icon: ShoppingCart,  color: 'amber' },
    { label: 'Platform Revenue', value: `$${analytics.totalRevenue.toFixed(2)}`,  icon: DollarSign,    color: 'emerald' },
    { label: 'Pending KYC',      value: analytics.pendingKYC.toString(),          icon: Clock,         color: 'yellow' },
    { label: 'Open Disputes',    value: analytics.openDisputes.toString(),         icon: AlertTriangle, color: 'red' },
  ] : [];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    amber: 'bg-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'users', 'products', 'disputes', 'kyc'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-all
              ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {tab}
            {tab === 'disputes' && analytics?.openDisputes ? (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {analytics.openDisputes}
              </span>
            ) : null}
            {tab === 'kyc' && analytics?.pendingKYC ? (
              <span className="ml-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full">
                {analytics.pendingKYC}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map(stat => (
              <div key={stat.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className={`inline-flex p-2 rounded-lg mb-3 ${colorMap[stat.color]}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue Table */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold">Revenue (Last 30 Days)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-400">Date</th>
                    <th className="text-right px-4 py-3 text-gray-400">Orders</th>
                    <th className="text-right px-4 py-3 text-gray-400">Volume</th>
                    <th className="text-right px-4 py-3 text-gray-400">Revenue (5%)</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((row, i) => (
                    <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">{row.orders}</td>
                      <td className="px-4 py-3 text-right text-blue-400">
                        ${parseFloat(row.volume).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-400 font-medium">
                        ${parseFloat(row.revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && <AdminUsersTable />}
      {activeTab === 'products' && <AdminProductsTable />}
      {activeTab === 'disputes' && <AdminDisputesTable />}
      {activeTab === 'kyc' && <AdminKYCTable />}
    </div>
  );
}

// Sub-components (simplified)
function AdminUsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/admin/users', { search }).then((d: any) => setUsers(d.items));
  }, [search]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <input
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none w-64"
        />
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="text-left px-4 py-3 text-gray-400">User</th>
            <th className="text-left px-4 py-3 text-gray-400">Role</th>
            <th className="text-left px-4 py-3 text-gray-400">KYC</th>
            <th className="text-left px-4 py-3 text-gray-400">Joined</th>
            <th className="text-right px-4 py-3 text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t border-gray-800 hover:bg-gray-800/50">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs capitalize">
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  user.kycStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                  user.kycStatus === 'pending'  ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {user.kycStatus || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => api.patch(`/api/admin/users/${user.id}/ban`, { banned: !user.isBanned })}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    user.isBanned
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                  }`}
                >
                  {user.isBanned ? 'Unban' : 'Ban'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminProductsTable() { return <div className="text-gray-400">Products management panel</div>; }
function AdminDisputesTable() { return <div className="text-gray-400">Disputes management panel</div>; }
function AdminKYCTable()      { return <div className="text-gray-400">KYC review panel</div>; }
