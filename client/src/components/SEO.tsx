import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'profile';
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
  structuredData?: string;
  locale?: string;
}

/**
 * SEO Component for managing meta tags dynamically
 * Handles Open Graph, Twitter Cards, and standard meta tags
 */
export default function SEO({
  title = 'المستشفى السعودي الألماني - صنعاء | احجز موعدك الآن',
  description = 'احجز موعدك مع أفضل الأطباء في المستشفى السعودي الألماني بصنعاء. خدمات طبية متميزة، عروض خاصة، ومخيمات صحية مجانية. اتصل الآن: 8000018',
  image = '/assets/og-image.jpg',
  url,
  canonicalUrl,
  type = 'website',
  keywords = 'المستشفى السعودي الألماني, صنعاء, حجز موعد, أطباء, عروض طبية, مخيمات صحية, استشارات طبية',
  ogTitle,
  ogDescription,
  ogImage,
  robots,
  structuredData,
  locale = 'ar_YE',
}: SEOProps) {
  const currentUrl = url || `https://sghsanaa.net${window.location.pathname}`;
  const resolvedCanonicalUrl = canonicalUrl || currentUrl;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMetaTag = (selector: string, content: string, attribute: string = 'content') => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [attr, value] = selector.match(/\[(.+?)=['"](.+?)['"]\]/)?.slice(1, 3) || [];
        if (attr && value) {
          element.setAttribute(attr, value);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    // Standard meta tags
    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[name="keywords"]', keywords);
    if (robots) {
      updateMetaTag('meta[name="robots"]', robots);
    }

    // Open Graph tags
    updateMetaTag('meta[property="og:title"]', ogTitle || title);
    updateMetaTag('meta[property="og:description"]', ogDescription || description);
    updateMetaTag('meta[property="og:image"]', ogImage || image);
    updateMetaTag('meta[property="og:url"]', currentUrl);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:site_name"]', 'المستشفى السعودي الألماني - صنعاء');
    updateMetaTag('meta[property="og:locale"]', locale);

    // Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', ogTitle || title);
    updateMetaTag('meta[name="twitter:description"]', ogDescription || description);
    updateMetaTag('meta[name="twitter:image"]', ogImage || image);

    // WhatsApp specific (uses Open Graph)
    updateMetaTag('meta[property="og:image:width"]', '1200');
    updateMetaTag('meta[property="og:image:height"]', '630');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', resolvedCanonicalUrl);

    const structuredDataId = 'cms-structured-data';
    const existingStructuredData = document.getElementById(structuredDataId);
    if (structuredData) {
      try {
        JSON.parse(structuredData);
        const script = existingStructuredData || document.createElement('script');
        script.id = structuredDataId;
        script.setAttribute('type', 'application/ld+json');
        script.textContent = structuredData;
        if (!existingStructuredData) {
          document.head.appendChild(script);
        }
      } catch {
        existingStructuredData?.remove();
      }
    } else {
      existingStructuredData?.remove();
    }
  }, [
    title,
    description,
    image,
    currentUrl,
    resolvedCanonicalUrl,
    type,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    robots,
    structuredData,
    locale,
  ]);

  return null; // This component doesn't render anything
}
