/**
 * Meta API Other Helpers - دوال مساعدة لـ Instagram, Facebook Pages, و CAPI
 * دوال مساعدة للتعامل مع Instagram Graph API, Facebook Pages, و Facebook Conversions API
 */

/**
 * جلب إحصائيات حساب Instagram Business
 */
export async function getInstagramProfile(
  accountId: string,
  getFn: (
    endpoint: string,
    params: Record<string, string>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
) {
  return getFn(accountId, {
    fields: 'followers_count,follows_count,media_count,profile_picture_url',
  });
}

/**
 * جلب إحصائيات من Instagram Insights
 */
export async function getInstagramInsights(
  accountId: string,
  period = 'days_28',
  getFn: (
    endpoint: string,
    params: Record<string, string>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
) {
  return getFn(`${accountId}/insights`, {
    metric: 'reach,impressions,profile_views',
    period,
  });
}

/**
 * جلب بيانات صفحة Facebook
 */
export async function getFacebookPage(
  pageId: string,
  getFn: (
    endpoint: string,
    params: Record<string, string>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
) {
  return getFn(pageId, { fields: 'fan_count,name,picture' });
}

/**
 * جلب إحصائيات صفحة Facebook
 */
export async function getFacebookPageInsights(
  pageId: string,
  period = 'days_28',
  getFn: (
    endpoint: string,
    params: Record<string, string>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
) {
  return getFn(`${pageId}/insights`, {
    metric:
      'page_views_total,page_engaged_users,page_impressions,page_post_engagements,page_impressions_organic',
    period,
  });
}

/**
 * إرسال حدث تحويل إلى Meta CAPI
 */
export async function sendCAPIEvent(
  pixelId: string,
  events: Record<string, unknown>[],
  postFn: (
    endpoint: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: unknown }>,
  testEventCode?: string
): Promise<{ success: boolean; error?: string }> {
  const payload: Record<string, unknown> = { data: events };
  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  const res = await postFn(`${pixelId}/events`, payload);
  if (!res.ok) {
    return {
      success: false,
      error: (res.error as { message?: string })?.message ?? 'خطأ غير معروف',
    };
  }
  return { success: true };
}
