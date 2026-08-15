/**
 * CampaignOverviewCards - بطاقات نظرة عامة على الحملات
 */

import { Activity, CheckCircle, PauseCircle, DollarSign, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Campaign } from '../types/campaign.types';

interface OverviewData {
  totalCampaigns?: number;
  activeCampaigns?: number;
  totalPlannedBudget?: number;
  totalActualBudget?: number;
}

interface CampaignOverviewCardsProps {
  overview: OverviewData | undefined;
  isLoading: boolean;
  campaigns: Campaign[];
}

export function CampaignOverviewCards({
  overview,
  isLoading,
  campaigns,
}: CampaignOverviewCardsProps) {
  const pausedCount = Array.isArray(campaigns)
    ? campaigns.filter((c: Campaign) => c.status === 'paused').length
    : 0;

  const totalTargets = campaigns
    ?.reduce((sum: number, c: Campaign) => sum + (c.targetLeads || 0), 0)
    .toLocaleString() || 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {/* Total Campaigns */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2 p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            إجمالي الحملات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {isLoading ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-600" />
          ) : (
            <div className="text-xl sm:text-2xl font-bold text-blue-800">
              {overview?.totalCampaigns || 0}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2 p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium text-green-700 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            نشطة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {isLoading ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-green-600" />
          ) : (
            <div className="text-xl sm:text-2xl font-bold text-green-800">
              {overview?.activeCampaigns || 0}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paused Campaigns */}
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="pb-2 p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium text-yellow-700 flex items-center gap-1.5">
            <PauseCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            متوقفة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {isLoading ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-yellow-600" />
          ) : (
            <div className="text-xl sm:text-2xl font-bold text-yellow-800">{pausedCount}</div>
          )}
        </CardContent>
      </Card>

      {/* Planned Budget */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2 p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium text-purple-700 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            الميزانية المخططة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {isLoading ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-purple-600" />
          ) : (
            <div className="text-base sm:text-lg font-bold text-purple-800">
              {(overview?.totalPlannedBudget || 0).toLocaleString()}
              <span className="text-[10px] sm:text-xs mr-1">ريال</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actual Budget */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-2 p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium text-orange-700 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            الميزانية الفعلية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {isLoading ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-orange-600" />
          ) : (
            <div className="text-base sm:text-lg font-bold text-orange-800">
              {(overview?.totalActualBudget || 0).toLocaleString()}
              <span className="text-[10px] sm:text-xs mr-1">ريال</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Targets */}
      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
        <CardHeader className="pb-2 p-3 md:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium text-teal-700 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            إجمالي الأهداف
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {isLoading ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-teal-600" />
          ) : (
            <div className="text-base sm:text-lg font-bold text-teal-800">
              {totalTargets}
              <span className="text-xs mr-1">عميل</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
