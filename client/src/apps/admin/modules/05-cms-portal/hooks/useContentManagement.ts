/**
 * useContentManagement - Custom Hook لإدارة المحتوى
 * Hook مخصص لإدارة المحتوى في صفحة إدارة المحتوى
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import type { ContentOverview } from '../types/content.types';

/**
 * useContentManagement - Hook لإدارة المحتوى
 */
export function useContentManagement() {
  // Tab state
  const [activeTab, setActiveTab] = useState('text');

  // Queries
  const { data: textOverview, isLoading: loadingTextOverview } =
    trpc.content.textContent.getOverview.useQuery();

  const { data: imageOverview, isLoading: loadingImageOverview } =
    trpc.content.images.getOverview.useQuery();

  const { data: colorOverview, isLoading: loadingColorOverview } =
    trpc.content.colorScheme.getOverview.useQuery();

  const { data: seoOverview, isLoading: loadingSeoOverview } =
    trpc.content.seoSettings.getOverview.useQuery();

  // Combine overview data
  const overview: ContentOverview | null =
    textOverview && imageOverview && colorOverview && seoOverview
      ? {
          totalTextContent: textOverview.total,
          totalImages: imageOverview.total,
          totalColorSchemes: colorOverview.total,
          totalSEOSettings: seoOverview.total,
          activeTextContent: textOverview.active,
          activeImages: imageOverview.active,
          activeColorSchemes: colorOverview.active,
          activeSEOSettings: seoOverview.active,
        }
      : null;

  const loadingOverview =
    loadingTextOverview || loadingImageOverview || loadingColorOverview || loadingSeoOverview;

  return {
    // State
    activeTab,
    overview,
    loadingOverview,

    // Setters
    setActiveTab,
  };
}
