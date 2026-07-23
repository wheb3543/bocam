/**
 * CampStatsPage - صفحة تقارير إحصائية للمخيمات
 * Camp statistics and reports page
 */
import { useState } from 'react';
import type { Camp } from '@/components/camp/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { useCampStats } from '@/hooks/camp/useCampStats';
import CampStatsCards from '@/components/camp/CampStatsCards';
import StatusPieChart from '@/components/charts/StatusPieChart';
import DistributionBarChart from '@/components/charts/DistributionBarChart';
import TimeLineChart from '@/components/charts/TimeLineChart';
import CampStatsExport from '@/components/camp/CampStatsExport';

export default function CampStatsPage() {
  const [selectedCamp, setSelectedCamp] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const campStats = useCampStats({ selectedCamp, autoRefresh });

  const handleRefresh = async () => {
    await campStats.refetch();
    toast.success('تم تحديث البيانات');
  };

  const timeMetrics = { avgToConfirm: 0, avgToAttend: 0, avgToCancel: 0 };

  if (campStats.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">إحصائيات المخيمات</h1>
            <p className="text-muted-foreground">تقارير وإحصائيات شاملة لتسجيلات المخيمات</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              تحديث
            </Button>
            <CampStatsExport
              selectedCamp={selectedCamp}
              camps={campStats.camps}
              stats={campStats.stats}
              statusData={campStats.statusData}
              ageData={campStats.ageData}
              genderData={campStats.genderData}
              sourceData={campStats.sourceData}
              procedureData={campStats.procedureData}
              registrations={campStats.registrations}
              timeMetrics={timeMetrics}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">المخيم:</label>
            <Select value={selectedCamp} onValueChange={setSelectedCamp}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="جميع المخيمات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المخيمات</SelectItem>
                {campStats.camps?.map((camp: Camp) => (
                  <SelectItem key={camp.id} value={camp.id?.toString() || ''}>
                    {camp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm font-medium">
              تحديث تلقائي كل دقيقة
            </label>
          </div>
        </div>

        {/* Stats Cards */}
        <CampStatsCards stats={campStats.stats} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusPieChart data={campStats.statusData} title="توزيع الحالات" />
          <DistributionBarChart data={campStats.ageData} title="توزيع الأعمار" />
          <DistributionBarChart data={campStats.genderData} title="توزيع الجنس" />
          <DistributionBarChart data={campStats.sourceData} title="مصادر التسجيل" />
          <DistributionBarChart data={campStats.procedureData} title="الإجراءات الأكثر شيوعاً" />
          <TimeLineChart data={campStats.dailyRegistrations} title="التسجيلات بمرور الوقت" />
        </div>
      </div>
    </DashboardLayout>
  );
}
