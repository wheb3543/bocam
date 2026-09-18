/**
 * Preview Section Component
 * مكون معاينة القسم العام
 */

import { Card, CardContent } from '@/components/ui/card';

interface PreviewSectionProps {
  textMap: Record<string, string>;
  imageMap: Record<string, string>;
  colorMap: Record<string, string>;
  sectionKey: string;
}

/**
 * PreviewSection - مكون معاينة القسم العام
 */
export function PreviewSection({ textMap, imageMap, colorMap, sectionKey }: PreviewSectionProps) {
  const title = textMap[`${sectionKey}.title`] || 'عنوان القسم';
  const description = textMap[`${sectionKey}.description`] || 'وصف القسم';
  const image = imageMap[`${sectionKey}.image`] || '';
  const primaryColor = colorMap['primary.500'] || '#3b82f6';
  const textColor = colorMap['text.primary'] || '#1f2937';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {image && (
            <img
              src={image}
              alt={title}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div>
            <h3 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
              {title}
            </h3>
            <p className="text-sm" style={{ color: textColor }}>
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
