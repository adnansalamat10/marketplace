// frontend/src/app/products/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { SearchFilters } from '@/components/product/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';
import { api } from '@/lib/api';

const CATEGORIES = [
  { id: 'accounts',      label: 'Accounts',        icon: '👤' },
  { id: 'game_currency', label: 'Game Currency',    icon: '🎮' },
  { id: 'gift_cards',    label: 'Gift Cards',       icon: '🎁' },
  { id: 'services',      label: 'Services',         icon: '⚡' },
  { id: 'social_media',  label: 'Social Media',     icon: '📱' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({
    query:    searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating:   searchParams.get('rating') || '',
    sort:     searchParams.get('sort') || 'createdAt',
    order:    searchParams.get('order') || 'DESC',
    page:     Number(searchParams.get('page') || 1),
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      );
      const data = await api.get(`/products?${params}`);
      setProducts(data.items);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key: string, value: any) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(updated).filter(([, v]) => v !== ''))
    );
    router.push(`/products?${params}`, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">

        {/* Category Bar */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => updateFilter('category', '')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
              ${!filters.category ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
                ${filters.category === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <SearchFilters filters={filters} onUpdate={updateFilter} />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Search Bar + Sort */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.query}
                onChange={e => updateFilter('query', e.target.value)}
                className="flex-1 bg-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                value={`${filters.sort}-${filters.order}`}
                onChange={e => {
                  const [sort, order] = e.target.value.split('-');
                  updateFilter('sort', sort);
                  setFilters(f => ({ ...f, order }));
                }}
                className="bg-gray-800 rounded-xl px-4 py-3 outline-none cursor-pointer"
              >
                <option value="createdAt-DESC">Newest</option>
                <option value="price-ASC">Price: Low to High</option>
                <option value="price-DESC">Price: High to Low</option>
                <option value="rating-DESC">Best Rated</option>
                <option value="totalSold-DESC">Best Selling</option>
              </select>
            </div>

            {/* Results Info */}
            <p className="text-gray-400 text-sm mb-4">
              {total.toLocaleString()} products found
            </p>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl h-72 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                page={filters.page}
                totalPages={Math.ceil(total / 20)}
                onPageChange={p => updateFilter('page', p)}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
