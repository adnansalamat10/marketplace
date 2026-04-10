// frontend/src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplace.com';

  // Static pages
  const statics: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/products`,               changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/auth/login`,             changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/auth/register`,          changeFrequency: 'monthly', priority: 0.3 },
    ...['accounts', 'game_currency', 'gift_cards', 'services', 'social_media'].map(c => ({
      url: `${BASE}/products?category=${c}`,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
  ];

  // Dynamic product pages
  try {
    const data: any = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=1000&status=active`)
      .then(r => r.json());

    const productPages: MetadataRoute.Sitemap = (data.items || []).map((p: any) => ({
      url: `${BASE}/products/${p.id}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...statics, ...productPages];
  } catch {
    return statics;
  }
}

// ─────────────────────────────────────────────────────────────
// frontend/src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketplace.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin/', '/dashboard/', '/api/', '/checkout/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
