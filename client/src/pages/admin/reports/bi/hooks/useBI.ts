/**
 * useBI - Custom hook لصفحة ذكاء الأعمال
 * يتولى جلب البيانات وحساب الاتجاهات
 */

import { useMemo } from 'react';
import { trpc } from '@/lib/api/trpc';
import type { Trends } from '../types/bi.types';
import { calculateTrend } from '../utils/biHelpers';

interface UseBIProps {
  autoRefresh: boolean;
  start: string;
  end: string;
  prevStart: string;
  prevEnd: string;
}

export function useBI({ autoRefresh, start, end, prevStart, prevEnd }: UseBIProps) {
  const {
    data: funnelData,
    isLoading: funnelLoading,
    refetch: refetchFunnel,
  } = trpc.tracking.conversionFunnel.useQuery(
    { startDate: start, endDate: end },
    { refetchInterval: autoRefresh ? 60000 : false }
  );

  const { data: prevFunnelData } = trpc.tracking.conversionFunnel.useQuery(
    { startDate: prevStart, endDate: prevEnd },
    { enabled: !!start && !!end }
  );

  const {
    data: sourceData,
    isLoading: sourceLoading,
    refetch: refetchSource,
  } = trpc.tracking.sourceBreakdown.useQuery(
    { startDate: start, endDate: end },
    { refetchInterval: autoRefresh ? 60000 : false }
  );

  const {
    data: campaignData,
    isLoading: campaignLoading,
    refetch: refetchCampaign,
  } = trpc.tracking.campaignPerformance.useQuery(
    { startDate: start, endDate: end },
    { refetchInterval: autoRefresh ? 60000 : false }
  );

  const { data: dailyStats, isLoading: dailyStatsLoading } = trpc.tracking.dailyStats.useQuery(
    { startDate: start, endDate: end },
    { refetchInterval: autoRefresh ? 60000 : false }
  );

  // Calculate trends
  const trends = useMemo<Trends | null>(() => {
    if (!funnelData || !prevFunnelData) {return null;}

    return {
      totalSessions: calculateTrend(funnelData.totalSessions, prevFunnelData.totalSessions),
      converted: calculateTrend(funnelData.converted, prevFunnelData.converted),
      abandoned: calculateTrend(funnelData.abandoned, prevFunnelData.abandoned),
      conversionRate: calculateTrend(
        funnelData.totalSessions > 0 ? (funnelData.converted / funnelData.totalSessions) * 100 : 0,
        prevFunnelData.totalSessions > 0
          ? (prevFunnelData.converted / prevFunnelData.totalSessions) * 100
          : 0
      ),
    };
  }, [funnelData, prevFunnelData]);

  const handleRefresh = async () => {
    await Promise.all([refetchFunnel(), refetchSource(), refetchCampaign()]);
  };

  return {
    funnelData,
    sourceData,
    campaignData,
    dailyStats,
    trends,
    funnelLoading,
    sourceLoading,
    campaignLoading,
    dailyStatsLoading,
    handleRefresh,
  };
}
