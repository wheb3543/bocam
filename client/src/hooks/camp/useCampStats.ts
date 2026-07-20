import { useMemo } from 'react';
import { trpc } from '@/lib/api/trpc';
import type { CampRegistration } from '@/types/camp';

interface CampStatsHookProps {
  selectedCamp?: string;
  autoRefresh?: boolean;
}

interface CampStats {
  totalRegistrations: number;
  pendingCount: number;
  confirmedCount: number;
  attendedCount: number;
  cancelledCount: number;
  completedCount: number;
  contactedCount: number;
  noAnswerCount: number;
  attendanceRate: number;
  cancellationRate: number;
  completionRate: number;
}

export function useCampStats({ selectedCamp = 'all', autoRefresh = false }: CampStatsHookProps) {
  const {
    data: registrations,
    isLoading: registrationsLoading,
    refetch,
  } = trpc.campRegistrations.list.useQuery(undefined, {
    refetchInterval: autoRefresh ? 60000 : false,
  });

  const { data: camps, isLoading: campsLoading } = trpc.camps.getAll.useQuery();

  // Filter registrations by selected camp
  const filteredRegistrations = useMemo(() => {
    return selectedCamp === 'all'
      ? registrations || []
      : (registrations || []).filter((r) => r.campId?.toString() === selectedCamp);
  }, [selectedCamp, registrations]);

  // Calculate statistics
  const stats: CampStats = useMemo(() => {
    const totalRegistrations = filteredRegistrations.length;
    const pendingCount = filteredRegistrations.filter((r) => r.status === 'pending').length;
    const confirmedCount = filteredRegistrations.filter((r) => r.status === 'confirmed').length;
    const attendedCount = filteredRegistrations.filter((r) => r.status === 'attended').length;
    const cancelledCount = filteredRegistrations.filter((r) => r.status === 'cancelled').length;
    const completedCount = filteredRegistrations.filter((r) => r.status === 'completed').length;
    const contactedCount = filteredRegistrations.filter((r) => r.status === 'contacted').length;
    const noAnswerCount = filteredRegistrations.filter((r) => r.status === 'no_answer').length;

    const attendanceRate =
      confirmedCount > 0 ? Math.round((attendedCount / confirmedCount) * 100) : 0;
    const cancellationRate =
      totalRegistrations > 0 ? Math.round((cancelledCount / totalRegistrations) * 100) : 0;
    const completionRate =
      attendedCount > 0 ? Math.round((completedCount / attendedCount) * 100) : 0;

    return {
      totalRegistrations,
      pendingCount,
      confirmedCount,
      attendedCount,
      cancelledCount,
      completedCount,
      contactedCount,
      noAnswerCount,
      attendanceRate,
      cancellationRate,
      completionRate,
    };
  }, [filteredRegistrations]);

  // Status distribution for pie chart
  const statusData: Array<{ name: string; value: number; color: string }> = useMemo(() => {
    return [
      { name: 'قيد الانتظار', value: stats.pendingCount, color: '#F59E0B' },
      { name: 'تم التواصل', value: stats.contactedCount, color: '#8B5CF6' },
      { name: 'لا رد', value: stats.noAnswerCount, color: '#6B7280' },
      { name: 'مؤكد', value: stats.confirmedCount, color: '#10B981' },
      { name: 'حضر', value: stats.attendedCount, color: '#3B82F6' },
      { name: 'مكتمل', value: stats.completedCount, color: '#8B5CF6' },
      { name: 'ملغي', value: stats.cancelledCount, color: '#EF4444' },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Age distribution
  const ageData: Array<{ name: string; value: number; color: string }> = useMemo(() => {
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0,
    };

    filteredRegistrations.forEach((r: CampRegistration) => {
      if (r.age) {
        if (r.age <= 18) {
          ageGroups['0-18']++;
        } else if (r.age <= 35) {
          ageGroups['19-35']++;
        } else if (r.age <= 50) {
          ageGroups['36-50']++;
        } else if (r.age <= 65) {
          ageGroups['51-65']++;
        } else {
          ageGroups['65+']++;
        }
      }
    });

    return Object.entries(ageGroups)
      .map(([name, value]) => ({ name, value, color: '#10B981' }))
      .filter((item) => item.value > 0);
  }, [filteredRegistrations]);

  // Gender distribution
  const genderData: Array<{ name: string; value: number; color: string }> = useMemo(() => {
    const genderGroups = {
      male: 0,
      female: 0,
    };

    filteredRegistrations.forEach((r: CampRegistration) => {
      if (r.gender && (r.gender === 'male' || r.gender === 'female')) {
        genderGroups[r.gender as 'male' | 'female']++;
      }
    });

    return [
      { name: 'ذكور', value: genderGroups.male, color: '#3B82F6' },
      { name: 'إناث', value: genderGroups.female, color: '#EC4899' },
    ].filter((item) => item.value > 0);
  }, [filteredRegistrations]);

  // Popular procedures
  const procedureData: Array<{ name: string; value: number; color: string }> = useMemo(() => {
    const procedureCounts: Record<string, number> = {};
    filteredRegistrations.forEach((r: CampRegistration) => {
      if (r.procedures) {
        try {
          const procs = JSON.parse(r.procedures);
          if (Array.isArray(procs)) {
            procs.forEach((proc) => {
              procedureCounts[proc] = (procedureCounts[proc] || 0) + 1;
            });
          } else if (typeof procs === 'string') {
            procedureCounts[procs] = (procedureCounts[procs] || 0) + 1;
          }
        } catch {
          procedureCounts[r.procedures] = (procedureCounts[r.procedures] || 0) + 1;
        }
      }
    });

    return Object.entries(procedureCounts)
      .map(([name, value]) => ({ name, value, color: '#3B82F6' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredRegistrations]);

  // Registrations by source
  const sourceData: Array<{ name: string; value: number; color: string }> = useMemo(() => {
    const sourceCountsMap = new Map<string, number>();
    filteredRegistrations.forEach((r: CampRegistration) => {
      const source = r.source || 'direct';
      sourceCountsMap.set(source, (sourceCountsMap.get(source) || 0) + 1);
    });

    const sourceDisplayMap: Record<string, { name: string; color: string }> = {
      facebook: { name: 'فيسبوك', color: '#1877F2' },
      instagram: { name: 'إنستغرام', color: '#E4405F' },
      telegram: { name: 'تيليجرام', color: '#0088CC' },
      manual: { name: 'يدوي', color: '#FFA500' },
      direct: { name: 'مباشر', color: '#6B7280' },
      web: { name: 'موقع الويب', color: '#0066CC' },
      website: { name: 'موقع الويب', color: '#0066CC' },
      phone: { name: 'هاتف', color: '#00A651' },
    };

    return Array.from(sourceCountsMap.entries())
      .map(([source, value]) => ({
        name: sourceDisplayMap[source]?.name || source,
        value,
        color: sourceDisplayMap[source]?.color || '#9CA3AF',
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRegistrations]);

  // Daily registrations over time
  const dailyRegistrations = useMemo(() => {
    const dateMap = new Map<string, number>();
    filteredRegistrations.forEach((r: CampRegistration) => {
      if (r.createdAt) {
        const date = new Date(r.createdAt).toLocaleDateString('ar-SA', {
          month: 'short',
          day: 'numeric',
        });
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }
    });
    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [filteredRegistrations]);

  // Funnel Data
  const funnelData = useMemo(() => {
    const stages = [
      { name: 'إجمالي التسجيلات', value: stats.totalRegistrations, color: '#3B82F6' },
      { name: 'قيد الانتظار', value: stats.pendingCount, color: '#F59E0B' },
      { name: 'مؤكد', value: stats.confirmedCount, color: '#10B981' },
      { name: 'حضر', value: stats.attendedCount, color: '#8B5CF6' },
      { name: 'مكتمل', value: stats.completedCount, color: '#EC4899' },
    ].filter((item) => item.value > 0);

    const withDropOff = stages.map((stage, index) => {
      const previousValue = index > 0 ? stages[index - 1].value : stage.value;
      const dropOff =
        previousValue > 0 ? Math.round(((previousValue - stage.value) / previousValue) * 100) : 0;
      return {
        ...stage,
        dropOff: index === 0 ? 0 : dropOff,
        conversionRate:
          index === 0
            ? 100
            : previousValue > 0
              ? Math.round((stage.value / previousValue) * 100)
              : 0,
      };
    });

    return withDropOff;
  }, [stats]);

  // Status by Camp
  const statusByCamp = useMemo(() => {
    const campMap = new Map<number, { [key: string]: number }>();

    filteredRegistrations.forEach((r: CampRegistration) => {
      if (r.campId && r.status) {
        const current = campMap.get(r.campId) || {};
        current[r.status] = (current[r.status] || 0) + 1;
        campMap.set(r.campId, current);
      }
    });

    return Array.from(campMap.entries())
      .map(([campId, statusCounts]) => {
        const camp = camps?.find((c) => c.id === campId);
        return {
          campName: camp?.name || `مخيم ${campId}`,
          pending: Number(statusCounts.pending) || 0,
          contacted: Number(statusCounts.contacted) || 0,
          no_answer: Number(statusCounts.no_answer) || 0,
          confirmed: Number(statusCounts.confirmed) || 0,
          attended: Number(statusCounts.attended) || 0,
          completed: Number(statusCounts.completed) || 0,
          cancelled: Number(statusCounts.cancelled) || 0,
        };
      })
      .sort((a, b) => {
        const totalA = Object.values(a).reduce(
          (sum: number, val) => sum + (typeof val === 'number' ? val : Number(val) || 0),
          0
        );
        const totalB = Object.values(b).reduce(
          (sum: number, val) => sum + (typeof val === 'number' ? val : Number(val) || 0),
          0
        );
        return totalB - totalA;
      })
      .slice(0, 10);
  }, [filteredRegistrations, camps]);

  return {
    registrations: filteredRegistrations,
    camps,
    isLoading: registrationsLoading || campsLoading,
    refetch,
    stats,
    statusData,
    ageData,
    genderData,
    procedureData,
    sourceData,
    dailyRegistrations,
    funnelData,
    statusByCamp,
  };
}
