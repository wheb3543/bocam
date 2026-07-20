/**
 * Cache Invalidation Helper
 * دالة مساعدة لإبطال الـ Cache بشكل موحد
 */

import { serverCache, CacheKeys } from './cache';

/**
 * أنواع الكائنات التي يمكن إبطال cache لها
 */
export type EntityType = 'appointments' | 'campRegistrations' | 'offerLeads';

/**
 * خريطة البادئات للكائنات
 */
const prefixMap: Record<EntityType, string> = {
  appointments: 'paginated:appointments:',
  campRegistrations: 'paginated:campRegistrations:',
  offerLeads: 'paginated:offerLeads:',
};

/**
 * خريطة مفاتيح القوائم للكائنات
 */
const listMap: Record<EntityType, string> = {
  appointments: 'list:appointments',
  campRegistrations: 'list:campRegistrations',
  offerLeads: 'list:offerLeads',
};

/**
 * خريطة مفاتيح الإحصائيات للكائنات
 */
const statsKeyMap: Record<EntityType, string> = {
  appointments: CacheKeys.appointmentStats(),
  campRegistrations: CacheKeys.campRegistrationStats(),
  offerLeads: CacheKeys.offerLeadStats(),
};

/**
 * إبطال cache للكائنات
 * @param entityType - نوع الكائن
 */
export function invalidateEntityCache(entityType: EntityType): void {
  serverCache.invalidateByPrefix(prefixMap[entityType]);
  serverCache.invalidate(listMap[entityType]);
  serverCache.invalidate(statsKeyMap[entityType]);
}
