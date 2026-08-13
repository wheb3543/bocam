/**
 * Import/Export Hook
 * Hook لاستيراد وتصدير المحتوى
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';

interface ImportData {
  pages?: Array<Record<string, unknown>>;
  sections?: Array<Record<string, unknown>>;
  sectionButtons?: Array<Record<string, unknown>>;
  textContent?: Array<Record<string, unknown>>;
  images?: Array<Record<string, unknown>>;
}

export function useImportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportQuery = trpc.content.importExport.export.useQuery({});
  const importMutation = trpc.content.importExport.import.useMutation();
  const overviewQuery = trpc.content.importExport.getOverview.useQuery();

  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const data = await exportQuery.refetch();
      if (data.data) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('تم تصدير المحتوى بنجاح');
      }
    } catch (error) {
      toast.error('فشل تصدير المحتوى');

      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (data: unknown): Promise<void> => {
    setIsImporting(true);
    try {
      await importMutation.mutateAsync(data as ImportData);
      toast.success('تم استيراد المحتوى بنجاح');
    } catch (error) {
      toast.error('فشل استيراد المحتوى. تأكد من صحة الملف');

      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isExporting,
    isImporting,
    overview: overviewQuery.data,
    isLoadingOverview: overviewQuery.isLoading,
    handleExport,
    handleImport,
    refetchOverview: overviewQuery.refetch,
  };
}
