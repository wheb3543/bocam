/**
 * Preview Features Component
 * مكون معاينة قسم المميزات
 */

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface PreviewFeaturesProps {
  textMap: Record<string, string>;
  imageMap: Record<string, string>;
  colorMap: Record<string, string>;
}

/**
 * PreviewFeatures - مكون معاينة قسم المميزات
 */
export function PreviewFeatures({ textMap, imageMap, colorMap }: PreviewFeaturesProps) {
  const title = textMap['features.title'] || 'مميزاتنا';
  const subtitle = textMap['features.subtitle'] || 'اكتشف ما يميزنا';
  const primaryColor = colorMap['primary.500'] || '#3b82f6';
  const textColor = colorMap['text.primary'] || '#1f2937';

  // Get feature items (assuming they have keys like features.1.title, features.1.description, etc.)
  const features = [
    {
      title: textMap['features.1.title'] || 'ميزة 1',
      description: textMap['features.1.description'] || 'وصف الميزة الأولى',
      image: imageMap['features.1.image'] || null,
    },
    {
      title: textMap['features.2.title'] || 'ميزة 2',
      description: textMap['features.2.description'] || 'وصف الميزة الثانية',
      image: imageMap['features.2.image'] || null,
    },
    {
      title: textMap['features.3.title'] || 'ميزة 3',
      description: textMap['features.3.description'] || 'وصف الميزة الثالثة',
      image: imageMap['features.3.image'] || null,
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
              {title}
            </h2>
            <p className="text-sm" style={{ color: textColor }}>
              {subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border"
                style={{ borderColor: primaryColor }}
              >
                {feature.image ? (
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <CheckCircle
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                    style={{ color: primaryColor }}
                  />
                )}
                <div>
                  <h4 className="font-semibold text-sm mb-1" style={{ color: textColor }}>
                    {feature.title}
                  </h4>
                  <p className="text-xs" style={{ color: textColor, opacity: 0.8 }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
