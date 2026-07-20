/**
 * CampaignsTab - تبويب الحملات
 * يعرض أداء الحملات الإعلانية
 */

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Target, Globe, MessageCircle, Smartphone, Search } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CampaignData } from '../types/bi.types';
import { COLORS } from '../types/bi.types';

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  facebook: <MessageCircle className="h-3 w-3" />,
  instagram: <Smartphone className="h-3 w-3" />,
  whatsapp: <MessageCircle className="h-3 w-3" />,
  google: <Search className="h-3 w-3" />,
  direct: <Globe className="h-3 w-3" />,
};

interface CampaignsTabProps {
  campaignData: CampaignData[] | undefined;
  isLoading: boolean;
}

const CampaignsTab = memo(function CampaignsTab({ campaignData, isLoading }: CampaignsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          أداء الحملات الإعلانية
        </CardTitle>
        <CardDescription>
          تحليل عائد الاستثمار (ROI) لكل حملة بناءً على معاملات UTM
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : campaignData && campaignData.length > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={campaignData.slice(0, 10)}
                layout="vertical"
                margin={{ right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="campaign"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="sessions"
                  name="الزيارات"
                  fill={COLORS.primary}
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="conversions"
                  name="التحويلات"
                  fill={COLORS.success}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right p-3 font-medium">الحملة</th>
                    <th className="text-right p-3 font-medium">المصدر</th>
                    <th className="text-right p-3 font-medium">الزيارات</th>
                    <th className="text-right p-3 font-medium">التحويلات</th>
                    <th className="text-right p-3 font-medium">معدل التحويل</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignData.map((campaign, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-medium">{campaign.campaign}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {SOURCE_ICONS[campaign.source] ?? <Globe className="h-3 w-3" />}
                          <span className="capitalize">{campaign.source}</span>
                        </div>
                      </td>
                      <td className="p-3">{campaign.sessions.toLocaleString()}</td>
                      <td className="p-3 text-green-600 font-medium">
                        {campaign.conversions.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge
                          className={
                            campaign.conversionRate >= 10
                              ? 'bg-green-100 text-green-700'
                              : campaign.conversionRate >= 5
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }
                        >
                          {campaign.conversionRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <Target className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">لا توجد بيانات حملات بعد</p>
            <p className="text-xs text-muted-foreground">
              ستظهر البيانات عند وصول زوار من روابط تحتوي على معاملات UTM
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default CampaignsTab;
