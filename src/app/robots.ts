import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://underdog.ai'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/practice/',
          '/analyze/',
          '/curriculum/',
          '/coach/',
          '/chat/',
          '/dashboard/',
          '/settings/',
          '/profile/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
