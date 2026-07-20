/**
 * DoctorStatsCards - بطاقات إحصائيات الأطباء
 */

import { Users, UserCheck, UserX, Plane } from 'lucide-react';
import type { DoctorStats } from '../types/doctor.types';

interface DoctorStatsCardsProps {
  stats: DoctorStats;
}

export function DoctorStatsCards({ stats }: DoctorStatsCardsProps) {
  return (
    <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {/* إجمالي الأطباء */}
      <div className="bg-white dark:bg-card dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground dark:text-muted-foreground">
            إجمالي الأطباء
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-foreground dark:text-gray-100">
          {stats.total}
        </div>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">جميع الأطباء</p>
      </div>

      {/* متاحون */}
      <div className="bg-white dark:bg-card dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground dark:text-muted-foreground">
            متاحون
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-emerald-600">
          {stats.available}
        </div>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">متاحون للحجز</p>
      </div>

      {/* غير متاحين */}
      <div className="bg-white dark:bg-card dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground dark:text-muted-foreground">
            غير متاحين
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <UserX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-red-500">
          {stats.unavailable}
        </div>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
          غير متاحين حالياً
        </p>
      </div>

      {/* أطباء زائرون */}
      <div className="bg-white dark:bg-card dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-800 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-medium text-purple-600">أطباء زائرون</span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <Plane className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-purple-700">
          {stats.visiting}
        </div>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">إجمالي الزائرين</p>
      </div>

      {/* زائرون متاحون */}
      <div className="bg-white dark:bg-card dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground dark:text-muted-foreground">
            زائرون متاحون
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
            <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-green-600">
          {stats.visitingAvailable}
        </div>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">زائرون للحجز</p>
      </div>

      {/* زائرون غير متاحين */}
      <div className="bg-white dark:bg-card dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground dark:text-muted-foreground">
            زائرون غير متاحين
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
            <UserX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-orange-500">
          {stats.visitingUnavailable}
        </div>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
          زائرون غير متاحين
        </p>
      </div>
    </div>
  );
}
