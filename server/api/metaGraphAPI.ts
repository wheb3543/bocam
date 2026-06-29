/**
 * Meta Graph API Integration
 * Fetches real data from Instagram and Facebook Business accounts
 *
 * ⚠️  القاعدة المعمارية: جميع طلبات Meta Graph API تمر عبر MetaApiService.
 *     لا يُسمح باستخدام process.env.META_ACCESS_TOKEN مباشرة هنا.
 */

import { meta } from './MetaApiService';

const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '';
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID || '';

interface InstagramInsights {
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_views: number;
  reach: number;
  impressions: number;
  engagement: number;
}

interface FacebookPageInsights {
  fan_count: number;
  page_views_total: number;
  page_engaged_users: number;
  page_impressions: number;
  page_post_engagements: number;
  page_impressions_organic: number;
}

/**
 * Fetch Instagram Business Account Insights
 */
export async function getInstagramInsights(): Promise<InstagramInsights | null> {
  if (!meta.accessToken || !INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    console.warn('[Meta API] Instagram credentials not configured');
    return null;
  }

  try {
    // Get account info via MetaApiService
    const accountRes = await meta.getInstagramProfile(INSTAGRAM_BUSINESS_ACCOUNT_ID);
    if (!accountRes.ok) {
      console.error('[Meta API] Instagram account error:', accountRes.error);
      return null;
    }
    const accountData = accountRes.data;

    // Get insights (last 28 days) via MetaApiService
    const insightsRes = await meta.getInstagramInsights(INSTAGRAM_BUSINESS_ACCOUNT_ID);
    if (!insightsRes.ok) {
      console.error('[Meta API] Instagram insights error:', insightsRes.error);
      return {
        followers_count: (accountData as { followers_count?: number })?.followers_count || 0,
        follows_count: (accountData as { follows_count?: number })?.follows_count || 0,
        media_count: (accountData as { media_count?: number })?.media_count || 0,
        profile_views: 0,
        reach: 0,
        impressions: 0,
        engagement: 0,
      };
    }

    const insightsData = insightsRes.data;
    const insights: Record<string, unknown> = {};
    if ((insightsData as { data?: Array<{ name: string; values: Array<{ value: number }> }> }).data) {
      (insightsData as { data?: Array<{ name: string; values: Array<{ value: number }> }> }).data?.forEach((metric: { name: string; values: Array<{ value: number }> }) => {
        if (metric.values && metric.values.length > 0) {
          insights[metric.name] = metric.values[metric.values.length - 1].value;
        }
      });
    }

    const totalEngagement = (insights as { reach?: number })?.reach || 0;
    const engagement =
      ((accountData as { followers_count?: number })?.followers_count || 0) > 0 ? (totalEngagement / ((accountData as { followers_count?: number })?.followers_count || 1)) * 100 : 0;

    return {
      followers_count: (accountData as { followers_count?: number })?.followers_count || 0,
      follows_count: (accountData as { follows_count?: number })?.follows_count || 0,
      media_count: (accountData as { media_count?: number })?.media_count || 0,
      profile_views: (insights as { profile_views?: number })?.profile_views || 0,
      reach: (insights as { reach?: number })?.reach || 0,
      impressions: (insights as { impressions?: number })?.impressions || 0,
      engagement: Math.round(engagement * 10) / 10,
    };
  } catch (error) {
    console.error('[Meta API] Instagram error:', error);
    return null;
  }
}

/**
 * Fetch Facebook Page Insights
 */
export async function getFacebookPageInsights(): Promise<FacebookPageInsights | null> {
  if (!meta.accessToken || !FACEBOOK_PAGE_ID) {
    console.warn('[Meta API] Facebook credentials not configured');
    return null;
  }

  try {
    // Get page info via MetaApiService
    const pageRes = await meta.getFacebookPage(FACEBOOK_PAGE_ID);
    if (!pageRes.ok) {
      console.error('[Meta API] Facebook page error:', pageRes.error);
      return null;
    }
    const pageData = pageRes.data;

    // Get insights (last 28 days) via MetaApiService
    const insightsRes = await meta.getFacebookPageInsights(FACEBOOK_PAGE_ID);
    if (!insightsRes.ok) {
      console.error('[Meta API] Facebook insights error:', insightsRes.error);
      return {
        fan_count: (pageData as { fan_count?: number })?.fan_count || 0,
        page_views_total: 0,
        page_engaged_users: 0,
        page_impressions: 0,
        page_post_engagements: 0,
        page_impressions_organic: 0,
      };
    }

    const insightsData = insightsRes.data;
    const insights: Record<string, unknown> = {};
    if ((insightsData as { data?: Array<{ name: string; values: Array<{ value: number }> }> }).data) {
      (insightsData as { data?: Array<{ name: string; values: Array<{ value: number }> }> }).data?.forEach((metric: { name: string; values: Array<{ value: number }> }) => {
        if (metric.values && metric.values.length > 0) {
          insights[metric.name] = metric.values[metric.values.length - 1].value;
        }
      });
    }

    return {
      fan_count: (pageData as { fan_count?: number })?.fan_count || 0,
      page_views_total: (insights as { page_views_total?: number })?.page_views_total || 0,
      page_engaged_users: (insights as { page_engaged_users?: number })?.page_engaged_users || 0,
      page_impressions: (insights as { page_impressions?: number })?.page_impressions || 0,
      page_post_engagements: (insights as { page_post_engagements?: number })?.page_post_engagements || 0,
      page_impressions_organic: (insights as { page_impressions_organic?: number })?.page_impressions_organic || 0,
    };
  } catch (error) {
    console.error('[Meta API] Facebook error:', error);
    return null;
  }
}

/**
 * Get combined social media stats
 */
export async function getCombinedSocialMediaStats() {
  const [instagram, facebook] = await Promise.all([
    getInstagramInsights(),
    getFacebookPageInsights(),
  ]);

  return {
    instagram,
    facebook,
    timestamp: new Date().toISOString(),
  };
}
