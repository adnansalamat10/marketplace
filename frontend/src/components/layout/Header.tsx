// frontend/src/components/layout/Header.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, ShoppingCart, Bell, User, Menu, X,
  Sun, Moon, ChevronDown, LogOut, Settings, Package,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore, useCartStore, useNotificationsStore } from '@/store';
import { api } from '@/lib/api';

const CATEGORIES = [
  { id: 'accounts',       label: 'Accounts',      icon: '👤' },
  { id: 'game_currency',  label: 'Game Currency', icon: '🎮' },
  { id: 'gift_cards',     label: 'Gift Cards',    icon: '🎁' },
  { id: 'services',       label: 'Services',      icon: '⚡' },
  { id: 'social_media',   label: 'Social Media',  icon: '📱' },
];

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const { notifications, unreadCount, markAllRead } = useNotificationsStore();

  const [searchQuery, setSearchQuery]         = useState('');
  const [mobileOpen, setMobileOpen]           = useState(false);
  const [userMenuOpen, setUserMenuOpen]        = useState(false);
  const [notifOpen, setNotifOpen]             = useState(false);
  const [categoriesOpen, setCategoriesOpen]   = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleNotifOpen = () => {
    setNotifOpen(v => !v);
    if (!notifOpen && unreadCount > 0) {
      markAllRead();
      api.patch('/api/notifications/read-all');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              M
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">Marketplace</span>
          </Link>

          {/* Categories dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCategoriesOpen(v => !v)}
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-sm"
            >
              Categories <ChevronDown className="w-4 h-4" />
            </button>
            {categoriesOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                  >
                    <span>{cat.icon}</span>
                    <span className="text-sm text-gray-300">{cat.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, games, accounts..."
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 transition-all"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {user ? (
              <>
                {/* Notifications */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={handleNotifOpen}
                    className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-700 font-medium text-sm">Notifications</div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-8">No notifications</p>
                        ) : (
                          notifications.slice(0, 10).map(n => (
                            <div key={n.id} className={`px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors
                              ${!n.isRead ? 'bg-blue-500/5' : ''}`}>
                              <p className="text-sm font-medium text-white">{n.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard/buyer" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-sm transition-colors">
                        <User className="w-4 h-4 text-gray-400" /> My Orders
                      </Link>
                      {(user.role === 'seller' || user.role === 'admin') && (
                        <Link href="/dashboard/seller" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-sm transition-colors">
                          <Package className="w-4 h-4 text-gray-400" /> Seller Dashboard
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-sm transition-colors">
                          <Settings className="w-4 h-4 text-gray-400" /> Admin Panel
                        </Link>
                      )}
                      <button onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-sm text-red-400 transition-colors border-t border-gray-700">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login"
                  className="text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Login
                </Link>
                <Link href="/auth/register"
                  className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-800 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-800 py-3 pb-4 space-y-1">
            {CATEGORIES.map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.id}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-800 text-sm">
                <span>{cat.icon}</span> {cat.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
