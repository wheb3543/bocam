import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Plus, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import {
  useWhatsAppSSE,
  TemplateDisabledEvent,
  TemplateEnabledEvent,
  TemplateNameUpdateEvent,
  TemplateCategoryUpdateEvent,
  TemplateLanguageUpdateEvent,
  TemplateEvent,
} from '@/hooks/integrations/useWhatsAppSSE';
import { useTemplateManagement } from './hooks/useTemplateManagement';
import { TemplateStats } from './components/TemplateStats';
import { TemplateFilters } from './components/TemplateFilters';
import { TemplateList } from './components/TemplateList';
import { TemplateFormDialog } from './components/TemplateFormDialog';
import { TemplatePreviewDialog } from './components/TemplatePreviewDialog';
import { TemplateTestDialog } from './components/TemplateTestDialog';
import { TemplateQualityTab } from './components/TemplateQualityTab';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WhatsAppTemplatesPage() {
  return (
    <DashboardLayout pageTitle="قوالب واتساب" pageDescription="إدارة قوالب رسائل واتساب">
      <WhatsAppTemplatesContent />
    </DashboardLayout>
  );
}

// ─── Main Content ────────────────────────────────────────────────────────────────
function WhatsAppTemplatesContent() {
  const templateManagement = useTemplateManagement();

  // SSE: تحديث فوري عند وصول أحداث القوالب الجديدة
  useWhatsAppSSE({
    onTemplateDisabled: (_event: TemplateDisabledEvent) => {
      templateManagement.refetch();
    },
    onTemplateEnabled: (_event: TemplateEnabledEvent) => {
      templateManagement.refetch();
    },
    onTemplateNameUpdate: (_event: TemplateNameUpdateEvent) => {
      templateManagement.refetch();
    },
    onTemplateCategoryUpdate: (_event: TemplateCategoryUpdateEvent) => {
      templateManagement.refetch();
    },
    onTemplateLanguageUpdate: (_event: TemplateLanguageUpdateEvent) => {
      templateManagement.refetch();
    },
    onTemplateEvent: (_event: TemplateEvent) => {
      templateManagement.refetch();
    },
  });

  return (
    <div className="space-y-4 md:space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            قوالب الرسائل
          </h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة قوالب واتساب المعتمدة من Meta</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => templateManagement.syncFromMetaMutation.mutate()}
            variant="outline"
            size="sm"
            disabled={templateManagement.syncFromMetaMutation.isPending}
            className="gap-1.5"
          >
            {templateManagement.syncFromMetaMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            مزامنة Meta
          </Button>
          <Dialog
            open={templateManagement.isCreateOpen}
            onOpenChange={(v) => {
              templateManagement.setIsCreateOpen(v);
              if (!v) {
                templateManagement.resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700">
                <Plus className="h-3.5 w-3.5" />
                قالب جديد
              </Button>
            </DialogTrigger>
            <TemplateFormDialog
              open={templateManagement.isCreateOpen}
              onOpenChange={templateManagement.setIsCreateOpen}
              mode="create"
              name={templateManagement.name}
              content={templateManagement.content}
              category={templateManagement.category}
              language={templateManagement.language}
              onNameChange={templateManagement.setName}
              onContentChange={templateManagement.setContent}
              onCategoryChange={templateManagement.setCategory}
              onLanguageChange={templateManagement.setLanguage}
              onSubmit={templateManagement.handleCreate}
              isPending={templateManagement.createMutation.isPending}
            />
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={templateManagement.activeTab} onValueChange={templateManagement.setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="templates">القوالب</TabsTrigger>
          <TabsTrigger value="quality">جودة القوالب</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          {/* Stats Cards */}
          <TemplateStats stats={templateManagement.stats} />

          {/* Meta Compliance Notice */}
          <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <strong>تنبيه Meta:</strong> يمكنك فقط إرسال رسائل باستخدام القوالب المعتمدة
              (APPROVED) من Meta Business Manager. القوالب غير المعتمدة لن تُرسل. قم بمزامنة القوالب
              بعد الموافقة عليها.
            </div>
          </div>

          {/* Filters */}
          <TemplateFilters
            searchQuery={templateManagement.searchQuery}
            onSearchChange={templateManagement.setSearchQuery}
            filterStatus={templateManagement.filterStatus}
            onFilterStatusChange={templateManagement.setFilterStatus}
            filterCategory={templateManagement.filterCategory}
            onFilterCategoryChange={templateManagement.setFilterCategory}
          />

          {/* Templates Grid */}
          <TemplateList
            templates={templateManagement.templates || []}
            filteredTemplates={templateManagement.filteredTemplates}
            isLoading={templateManagement.isLoading}
            searchQuery={templateManagement.searchQuery}
            filterStatus={templateManagement.filterStatus}
            onEdit={templateManagement.handleEdit}
            onDelete={templateManagement.handleDelete}
            onTest={templateManagement.handleTest}
            onCopy={templateManagement.handleCopy}
            onPreview={templateManagement.handlePreview}
            onSync={() => templateManagement.syncFromMetaMutation.mutate()}
            isSyncPending={templateManagement.syncFromMetaMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="quality">
          <TemplateQualityTab
            templates={templateManagement.templates}
            selectedTemplateForQuality={templateManagement.selectedTemplateForQuality}
            onSelectedTemplateChange={templateManagement.setSelectedTemplateForQuality}
            qualityData={templateManagement.templateQualityQuery.data}
            isLoading={templateManagement.templateQualityQuery.isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <TemplateFormDialog
        open={templateManagement.isEditOpen}
        onOpenChange={templateManagement.setIsEditOpen}
        mode="edit"
        name={templateManagement.name}
        content={templateManagement.content}
        category={templateManagement.category}
        language={templateManagement.language}
        onNameChange={templateManagement.setName}
        onContentChange={templateManagement.setContent}
        onCategoryChange={templateManagement.setCategory}
        onLanguageChange={templateManagement.setLanguage}
        onSubmit={templateManagement.handleUpdate}
        isPending={templateManagement.updateMutation.isPending}
      />

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        open={templateManagement.isPreviewOpen}
        onOpenChange={templateManagement.setIsPreviewOpen}
        template={templateManagement.selectedTemplate}
        onTest={() => {
          if (templateManagement.selectedTemplate) {
            templateManagement.handleTest(templateManagement.selectedTemplate);
          }
        }}
      />

      {/* Test Send Dialog */}
      <TemplateTestDialog
        open={templateManagement.isTestOpen}
        onOpenChange={templateManagement.setIsTestOpen}
        template={templateManagement.selectedTemplate}
        testPhone={templateManagement.testPhone}
        onTestPhoneChange={templateManagement.setTestPhone}
        onSend={templateManagement.handleSendTest}
        isPending={templateManagement.sendTemplateMutation.isPending}
      />
    </div>
  );
}
