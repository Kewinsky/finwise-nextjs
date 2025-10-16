import { MetadataRoute } from 'next';
import { appConfig } from '@/config/app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/dashboard', '/api', '/admin', '/_next'],
      },
    ],
    sitemap: `${appConfig.urls.base}/sitemap.xml`,
  };
}
