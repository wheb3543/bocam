/**
 * Preview Hero Component
 * مكون معاينة قسم البطل (Hero Section)
 */

import { Card, CardContent } from '@/components/ui/card';

interface PreviewHeroProps {
  textMap: Record<string, string>;
  imageMap: Record<string, string>;
  colorMap: Record<string, string>;
}

/**
 * PreviewHero - مكون معاينة قسم البطل
 */
export function PreviewHero({ textMap, imageMap, colorMap }: PreviewHeroProps) {
  const heroTitle = textMap['hero.title'] || 'عنوان البطل';
  const heroSubtitle = textMap['hero.subtitle'] || 'عنوان فرعي للبطل';
  const heroDescription = textMap['hero.description'] || 'وصف قسم البطل';
  const heroButtonText = textMap['hero.button.text'] || 'ابدأ الآن';
  const heroBanner = imageMap['hero.banner'] || '';
  const primaryColor = colorMap['primary.500'] || '#3b82f6';
  const textColor = colorMap['text.primary'] || '#1f2937';

  return (
    <Card>
      <CardContent className="p-4">
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            backgroundColor: primaryColor,
            minHeight: '200px',
          }}
        >
          {heroBanner && (
            <img
              src={heroBanner}
              alt="Hero Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="relative z-10 p-6 text-center">
            <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
              {heroTitle}
            </h2>
            <p className="text-lg mb-2" style={{ color: textColor }}>
              {heroSubtitle}
            </p>
            <p className="text-sm mb-4 opacity-80" style={{ color: textColor }}>
              {heroDescription}
            </p>
            <button
              className="px-4 py-2 rounded-md text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              {heroButtonText}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
