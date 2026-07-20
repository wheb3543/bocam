/**
 * Web Vitals Monitoring Hook
 * Hook لمراقبة أداء الويب وإرسال المقاييس
 */

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

interface WebVitalsConfig {
  sendToAnalytics?: (metric: Metric) => void;
  reportAllChanges?: boolean;
}

/**
 * Hook لمراقبة Web Vitals
 *
 * يقوم هذا Hook بقياس وإرسال مقاييس أداء الويب الأساسية
 * مثل CLS, FCP, LCP, TTFB, INP
 *
 * @param config - إعدادات المراقبة
 * @param config.sendToAnalytics - دالة لإرسال المقاييس إلى خدمة تحليلات
 * @param config.reportAllChanges - إرسال جميع التغييرات وليس فقط القيمة النهائية
 * @example
 * useWebVitals({
 *   sendToAnalytics: (metric) => {
 *     // إرسال إلى Sentry أو خدمة تحليلات أخرى
 *     console.log(metric);
 *   }
 * });
 */
export function useWebVitals(config: WebVitalsConfig = {}) {
  const { sendToAnalytics, reportAllChanges = false } = config;

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      // إرسال المقاييس إلى خدمة التحليلات
      if (sendToAnalytics) {
        sendToAnalytics(metric);
      }

      // إرسال إلى console في development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Web Vitals]', metric);
      }

      // إرسال إلى backend للتخزين والتحليل
      sendMetricToBackend(metric);
    };

    // مراقبة Core Web Vitals
    onCLS(handleMetric, { reportAllChanges });
    onFCP(handleMetric, { reportAllChanges });
    onLCP(handleMetric, { reportAllChanges });
    onTTFB(handleMetric, { reportAllChanges });
    onINP(handleMetric, { reportAllChanges });
  }, [sendToAnalytics, reportAllChanges]);
}

/**
 * إرسال المقاييس إلى backend
 */
function sendMetricToBackend(metric: Metric) {
  // إرسال إلى endpoint للتخزين والتحليل
  // يمكن استخدام fetch أو tRPC
  try {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
    }).catch((error) => {
      console.error('[Web Vitals] Failed to send metric:', error);
    });
  } catch (error) {
    console.error('[Web Vitals] Failed to send metric:', error);
  }
}

/**
 * تقييم أداء الصفحة بناءً على Web Vitals
 */
export function evaluatePerformance(metrics: Record<string, Metric>): {
  overall: 'good' | 'needs-improvement' | 'poor';
  scores: Record<string, 'good' | 'needs-improvement' | 'poor'>;
} {
  const scores: Record<string, 'good' | 'needs-improvement' | 'poor'> = {};

  // تقييم كل مقياس
  Object.entries(metrics).forEach(([name, metric]) => {
    scores[name] = metric.rating as 'good' | 'needs-improvement' | 'poor';
  });

  // تقييم الأداء العام
  const values = Object.values(scores);
  const poorCount = values.filter((v) => v === 'poor').length;
  const needsImprovementCount = values.filter((v) => v === 'needs-improvement').length;

  let overall: 'good' | 'needs-improvement' | 'poor';
  if (poorCount > 0) {
    overall = 'poor';
  } else if (needsImprovementCount > 0) {
    overall = 'needs-improvement';
  } else {
    overall = 'good';
  }

  return { overall, scores };
}
