/**
 * BI Helpers - دوال مساعدة لصفحة ذكاء الأعمال
 * دوال مساعدة للتعامل مع التواريخ والبيانات
 */

import { subDays } from 'date-fns';
import type { DateRange, DateRangeResult } from '../types/bi.types';

export function getDateRange(range: DateRange): DateRangeResult {
  const end = new Date();
  let start: Date;
  switch (range) {
    case '7d':
      start = subDays(end, 7);
      break;
    case '30d':
      start = subDays(end, 30);
      break;
    case '90d':
      start = subDays(end, 90);
      break;
    default:
      start = subDays(end, 30);
  }
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) {return current > 0 ? 100 : 0;}
  return ((current - previous) / previous) * 100;
}

export function formatDailyChartData(dailyStats: Array<{ date: string; sessions: number; conversions: number; conversionRate: number }>) {
  return dailyStats.map((stat) => ({
    date: new Date(stat.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
    sessions: stat.sessions,
    conversions: stat.conversions,
    conversionRate: stat.conversionRate,
  }));
}
