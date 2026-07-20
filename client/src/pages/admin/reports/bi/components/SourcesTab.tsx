/**
 * SourcesTab - تبويب المصادر
 * يعرض توزيع مصادر الزيارات وأداء كل مصدر
 */

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Globe, MessageCircle, Smartphone, Search } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SourceData } from '../types/bi.types';
import { SOURCE_COLORS } from '../types/bi.types';

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  facebook: <MessageCircle className="h-4 w-4" />,
  instagram: <Smartphone className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
  google: <Search className="h-4 w-4" />,
  direct: <Globe className="h-4 w-4" />,
};

interface SourcesTabProps {
  sourceData: SourceData[] | undefined;
  isLoading: boolean;
}

const SourcesTab = memo(function SourcesTab({ sourceData, isLoading }: SourcesTabProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            توزيع مصادر الزيارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sourceData && sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sourceData}
                  dataKey="total"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={(props: any) =>
                    `${props.source} (${((props.percent ?? 0) * 100).toFixed(0)}%)`
                  }
                >
                  {sourceData.map((entry, index) => (
                    <Cell
                      key={entry.source}
                      fill={SOURCE_COLORS[entry.source] ?? `hsl(${index * 45}, 70%, 50%)`}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value, _name) => [value, 'الزيارات']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بيانات مصادر بعد
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>أداء المصادر</CardTitle>
          <CardDescription>مقارنة الزيارات والتحويلات لكل مصدر</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sourceData && sourceData.length > 0 ? (
            <div className="space-y-3">
              {sourceData.map((source) => (
                <div key={source.source} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: SOURCE_COLORS[source.source] ?? '#6B7280' }}
                  >
                    {SOURCE_ICONS[source.source] ?? <Globe className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium capitalize">{source.source}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{source.total} زيارة</span>
                        <span className="text-green-600 font-medium">
                          {source.conversions} حجز
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {source.rate}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.round((source.total / (sourceData[0]?.total || 1)) * 100)}%`,
                          backgroundColor: SOURCE_COLORS[source.source] ?? '#6B7280',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بيانات مصادر بعد
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default SourcesTab;
