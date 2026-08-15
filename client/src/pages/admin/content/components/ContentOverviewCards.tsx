/**
 * Content Overview Cards Component
 * مكون بطاقات نظرة عامة على المحتوى
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Image, Palette, Search } from 'lucide-react';
import type { ContentOverview } from '../types/content.types';

interface ContentOverviewCardsProps {
  overview: ContentOverview | null;
  isLoading: boolean;
}

/**
 * ContentOverviewCards - مكون بطاقات نظرة عامة على المحتوى
 */
export function ContentOverviewCards({ overview, isLoading }: ContentOverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'النصوص والعناوين',
      icon: FileText,
      total: overview?.totalTextContent || 0,
      active: overview?.activeTextContent || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'الصور والوسائط',
      icon: Image,
      total: overview?.totalImages || 0,
      active: overview?.activeImages || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'نظام الألوان',
      icon: Palette,
      total: overview?.totalColorSchemes || 0,
      active: overview?.activeColorSchemes || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'إعدادات SEO',
      icon: Search,
      total: overview?.totalSEOSettings || 0,
      active: overview?.activeSEOSettings || 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.active}</div>
            <p className="text-xs text-muted-foreground">من أصل {card.total} عنصر</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
