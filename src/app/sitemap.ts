import { MetadataRoute } from 'next';
import { appConfig } from '@/config/app';

/**
 * Simple sitemap for MVP
 * Add new routes to this array as your app grows
 */
const ROUTES = [
  { url: '', priority: 1.0 },
  { url: '/about', priority: 0.8 },
  { url: '/pricing', priority: 0.9 },
  { url: '/blog', priority: 0.8 },
  { url: '/documentation', priority: 0.7 },
  { url: '/help', priority: 0.6 },
  { url: '/privacy', priority: 0.3 },
  { url: '/terms', priority: 0.3 },
  { url: '/cookies', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${appConfig.urls.base}${route.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route.priority,
  }));
}
