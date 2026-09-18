/**
 * Import/Export Hook
 * Hook لاستيراد وتصدير حزم CMS مع معاينة صريحة قبل التعديل.
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';

export interface CmsExportOptions {
  includePages: boolean;
  includeSections: boolean;
  includeSectionButtons: boolean;
  includeTextContent: boolean;
  includeImages: boolean;
  includeColors: boolean;
  includeSeoSettings: boolean;
  includeMedia: boolean;
  includeAuditLog: boolean;
}

export interface ImportPreview {
  total: number;
  counts: Record<string, number>;
  canImport: boolean;
  policy: string;
}

export interface ImportResult extends ImportPreview {
  success: boolean;
  importedAuditLog: number;
  skippedAuditLog: number;
}

type ImportPayload = {
  pages?: Array<Record<string, unknown>>;
  sections?: Array<Record<string, unknown>>;
  sectionButtons?: Array<Record<string, unknown>>;
  textContent?: Array<Record<string, unknown>>;
  images?: Array<Record<string, unknown>>;
  colors?: Array<Record<string, unknown>>;
  seoSettings?: Array<Record<string, unknown>>;
  mediaFolders?: Array<Record<string, unknown>>;
  media?: Array<Record<string, unknown>>;
  auditLog?: Array<Record<string, unknown>>;
  exportDate?: string;
  version?: string;
};

function asImportPayload(data: unknown): ImportPayload {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('ملف الاستيراد يجب أن يكون كائن JSON صالحاً.');
  }
  return data as ImportPayload;
}

const defaultExportOptions: CmsExportOptions = {
  includePages: true,
  includeSections: true,
  includeSectionButtons: true,
  includeTextContent: true,
  includeImages: true,
  includeColors: true,
  includeSeoSettings: true,
  includeMedia: true,
  includeAuditLog: true,
};

export function useImportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const utils = trpc.useUtils();
  const previewImportMutation = trpc.content.importExport.previewImport.useMutation();
  const importMutation = trpc.content.importExport.import.useMutation();
  const overviewQuery = trpc.content.importExport.getOverview.useQuery();

  const exportContent = async (options: CmsExportOptions = defaultExportOptions): Promise<void> => {
    setIsExporting(true);
    try {
      const data = await utils.content.importExport.export.fetch(options);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `sgh-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const previewImport = async (importData: unknown): Promise<ImportPreview> => {
    if (!importData || typeof importData !== 'object' || Array.isArray(importData)) {
      throw new Error('ملف الاستيراد يجب أن يكون كائن JSON صالحاً.');
    }
    return (await previewImportMutation.mutateAsync(importData)) as ImportPreview;
  };

  const confirmImport = async (importData: unknown): Promise<ImportResult> => {
    setIsImporting(true);
    try {
      const result = (await importMutation.mutateAsync({
        ...asImportPayload(importData),
        confirm: true,
      })) as ImportResult;
      await utils.invalidate();
      return result;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    defaultExportOptions,
    isExporting,
    isImporting,
    isPreviewingImport: previewImportMutation.isPending,
    overview: overviewQuery.data,
    isLoadingOverview: overviewQuery.isLoading,
    exportContent,
    previewImport,
    confirmImport,
    refetchOverview: overviewQuery.refetch,
  };
}
