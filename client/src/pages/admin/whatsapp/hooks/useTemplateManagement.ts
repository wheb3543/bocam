/**
 * useTemplateManagement - Custom hook لإدارة قوالب WhatsApp
 */

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { emitToastHash } from '@/lib/toastHashRouter';
import type { Template, TemplateStats } from '../types/template.types';

export function useTemplateManagement() {
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Form states
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('UTILITY');
  const [language, setLanguage] = useState('ar');
  const [testPhone, setTestPhone] = useState('');

  // Quality tab state
  const [selectedTemplateForQuality, setSelectedTemplateForQuality] = useState('');
  const [activeTab, setActiveTab] = useState('templates');

  // Queries
  const { data: templates, isLoading, refetch } = trpc.whatsapp.templates.list.useQuery();

  const templateQualityQuery = trpc.whatsapp.templateQuality.getHistory.useQuery(
    { templateId: selectedTemplateForQuality || undefined, limit: 100 },
    { enabled: !!selectedTemplateForQuality, refetchInterval: 60000 }
  );

  // Mutations
  const syncFromMetaMutation = trpc.whatsapp.templates.syncFromMeta.useMutation({
    onSuccess: (result: unknown) => {
      const message =
        (result as { message?: string; synced?: number }).message ||
        `تمت المزامنة: ${(result as { synced?: number }).synced} قالب جديد`;
      emitToastHash({
        kind: 'success',
        message,
        description: 'تمت مزامنة قوالب WhatsApp من Meta بنجاح.',
        redirect: '/admin/whatsapp/templates',
      });
      refetch();
    },
    onError: (error: unknown) =>
      toast.error(`فشل المزامنة: ${(error as { message?: string })?.message || 'خطأ'}`),
  });

  const createMutation = trpc.whatsapp.templates.create.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم إنشاء القالب بنجاح',
        description: 'تم حفظ القالب الجديد في إدارة القوالب.',
        redirect: '/admin/whatsapp/templates',
      });
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: unknown) =>
      toast.error(`فشل إنشاء القالب: ${(error as { message?: string })?.message || 'خطأ'}`),
  });

  const updateMutation = trpc.whatsapp.templates.update.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم تحديث القالب بنجاح',
        description: 'تم حفظ التغييرات الأخيرة على القالب.',
        redirect: '/admin/whatsapp/templates',
      });
      setIsEditOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: unknown) =>
      toast.error(`فشل تحديث القالب: ${(error as { message?: string })?.message || 'خطأ'}`),
  });

  const deleteMutation = trpc.whatsapp.templates.delete.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم حذف القالب',
        description: 'تم حذف القالب بنجاح من إدارة قوالب WhatsApp.',
        redirect: '/admin/whatsapp/templates',
      });
      refetch();
    },
    onError: (error: unknown) =>
      toast.error(`فشل الحذف: ${(error as { message?: string })?.message || 'خطأ'}`),
  });

  const sendTemplateMutation = trpc.whatsapp.sendTemplate.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: '✅ تم إرسال القالب بنجاح',
        description: 'تحقق من هاتفك لتلقي الرسالة.',
        redirect: '/admin/whatsapp/templates',
      });
      setIsTestOpen(false);
      setTestPhone('');
    },
    onError: (error: unknown) =>
      toast.error(`فشل الإرسال: ${(error as { message?: string })?.message || 'خطأ'}`),
  });

  // Helper functions
  const resetForm = () => {
    setName('');
    setContent('');
    setCategory('UTILITY');
    setLanguage('ar');
    setSelectedTemplate(null);
  };

  const handleCreate = () => {
    if (!name.trim() || !content.trim()) {
      toast.error('يرجى إدخال اسم القالب والمحتوى');
      return;
    }
    createMutation.mutate({ name: name.trim(), content: content.trim(), category, language });
  };

  const handleUpdate = () => {
    if (!selectedTemplate) {
      return;
    }
    updateMutation.mutate({
      id: selectedTemplate.id,
      name: name.trim(),
      content: content.trim(),
      category,
    });
  };

  const handleEdit = (t: Template) => {
    setSelectedTemplate(t);
    setName(t.name);
    setContent(t.content);
    setCategory(t.category);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const handlePreview = (t: Template) => {
    setSelectedTemplate(t);
    setIsPreviewOpen(true);
  };

  const handleTest = (t: Template) => {
    setSelectedTemplate(t);
    setIsTestOpen(true);
  };

  const handleCopy = (t: Template) => {
    setName(`نسخة من ${t.name}`);
    setContent(t.content);
    setCategory(t.category);
    setIsCreateOpen(true);
    toast.info('تم نسخ القالب — قم بتعديله وحفظه');
  };

  const handleSendTest = () => {
    if (!testPhone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }
    if (!selectedTemplate) {
      return;
    }
    sendTemplateMutation.mutate({
      phone: testPhone,
      templateName: selectedTemplate.metaName || selectedTemplate.name,
      language: selectedTemplate.languageCode || 'ar',
    });
  };

  // Computed values
  const stats = useMemo((): TemplateStats => {
    if (!templates) {
      return { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
    return {
      total: templates.length,
      approved: templates.filter((t: Template) => t.metaStatus === 'APPROVED').length,
      pending: templates.filter((t: Template) => t.metaStatus === 'PENDING').length,
      rejected: templates.filter((t: Template) => t.metaStatus === 'REJECTED').length,
    };
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    let result = templates || [];
    if (filterStatus !== 'all') {
      result = result.filter((t: Template) => t.metaStatus === filterStatus);
    }
    if (filterCategory !== 'all') {
      result = result.filter((t: Template) => t.category === filterCategory);
    }
    if (searchQuery) {
      result = result.filter(
        (t: Template) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.metaName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [templates, filterStatus, filterCategory, searchQuery]);

  return {
    // State
    isCreateOpen,
    isEditOpen,
    isPreviewOpen,
    isTestOpen,
    selectedTemplate,
    searchQuery,
    filterStatus,
    filterCategory,
    name,
    content,
    category,
    language,
    testPhone,
    selectedTemplateForQuality,
    activeTab,
    templates,
    isLoading,
    templateQualityQuery,
    stats,
    filteredTemplates,

    // Setters
    setIsCreateOpen,
    setIsEditOpen,
    setIsPreviewOpen,
    setIsTestOpen,
    setSearchQuery,
    setFilterStatus,
    setFilterCategory,
    setName,
    setContent,
    setCategory,
    setLanguage,
    setTestPhone,
    setSelectedTemplateForQuality,
    setActiveTab,

    // Handlers
    handleCreate,
    handleUpdate,
    handleEdit,
    handleDelete,
    handlePreview,
    handleTest,
    handleCopy,
    handleSendTest,
    resetForm,

    // Mutations
    syncFromMetaMutation,
    createMutation,
    updateMutation,
    deleteMutation,
    sendTemplateMutation,

    // Refetch
    refetch,
  };
}
