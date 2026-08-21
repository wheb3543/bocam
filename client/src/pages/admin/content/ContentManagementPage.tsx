import DashboardLayout from '@/components/layout/DashboardLayout';
import { ContentTabs } from './components/ContentTabs';
import { ContentOverviewCards } from './components/ContentOverviewCards';
import { TextContentList } from './components/TextContentList';
import { ImageList } from './components/ImageList';
import { ColorSchemeList } from './components/ColorSchemeList';
import { SEOList } from './components/SEOList';
import { PagesList } from './components/PagesList';
import { SectionsList } from './components/SectionsList';
import { SectionButtonsList } from './components/SectionButtonsList';
import { ContentImportExport } from './components/ContentImportExport';
import { BulkImageUpload } from './components/BulkImageUpload';
import { ContentPreviewPanel } from './components/preview/ContentPreviewPanel';
import { VersionHistoryDialog } from './components/dialogs/VersionHistoryDialog';
import { AuditLogDialog } from './components/dialogs/AuditLogDialog';
import { PageDialog } from './components/dialogs/PageDialog';
import { SectionDialog } from './components/dialogs/SectionDialog';
import { PageSettingsDialog } from './components/dialogs/PageSettingsDialog';
import { ApprovalQueueDialog } from './components/dialogs/ApprovalQueueDialog';
import { useContentManagement } from './hooks/useContentManagement';
import { useTextContent } from './hooks/useTextContent';
import { useImages } from './hooks/useImages';
import { useColorScheme } from './hooks/useColorScheme';
import { useSEO } from './hooks/useSEO';
import { usePages } from './hooks/usePages';
import type { Page } from './hooks/usePages';
import { useSections } from './hooks/useSections';
import { useSectionButtons } from './hooks/useSectionButtons';
import { useImportExport } from './hooks/useImportExport';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, History, FileText, ClipboardCheck } from 'lucide-react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';

/**
 * Content Management Page
 * صفحة إدارة المحتوى العامة
 */
export default function ContentManagementPage() {
  const contentManagement = useContentManagement();
  const textContent = useTextContent();
  const { data: homepageReadiness, refetch: refetchHomepageReadiness } =
    trpc.content.textContent.getHomepageReadiness.useQuery();
  const seedHomepageMutation = trpc.content.textContent.seedHomepage.useMutation({
    onSuccess: (result) => {
      toast.success(
        `تم إضافة بيانات الصفحة الرئيسية بنجاح: ${result.addedCount} عنصر جديد، ${result.skippedCount} عنصر موجود`
      );
      textContent.refetch();
      refetchHomepageReadiness();
    },
    onError: (error) => {
      toast.error('فشل إضافة بيانات الصفحة الرئيسية: ' + error.message);
    },
  });
  const images = useImages();
  const colorScheme = useColorScheme();
  const seo = useSEO();
  const pages = usePages();
  const sections = useSections();
  const sectionButtons = useSectionButtons();
  const importExport = useImportExport();

  // Preview state
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewLanguage, _setPreviewLanguage] = useState('ar');

  // Dialogs state
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isApprovalQueueOpen, setIsApprovalQueueOpen] = useState(false);
  const [selectedVersionEntityType, setSelectedVersionEntityType] = useState<
    'text' | 'image' | 'color' | 'seo'
  >('text');
  const [selectedVersionEntityId, setSelectedVersionEntityId] = useState<number>(0);
  const [isPageSettingsOpen, setIsPageSettingsOpen] = useState(false);
  const [selectedPageForSettings, setSelectedPageForSettings] = useState<number | null>(null);

  const handlePageSettings = (page: Page) => {
    setSelectedPageForSettings(page.id);
    setIsPageSettingsOpen(true);
  };

  const handleNavigateToTab = (tab: string) => {
    contentManagement.setActiveTab(tab);
  };

  return (
    <DashboardLayout pageTitle="إدارة المحتوى" pageDescription="إدارة شاملة لمحتوى المنصة العامة">
      <div className="space-y-4 md:space-y-6" dir="rtl">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => seedHomepageMutation.mutate()}
              disabled={seedHomepageMutation.isPending}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {seedHomepageMutation.isPending ? 'جاري الإضافة...' : 'إضافة بيانات الصفحة الرئيسية'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAuditLogOpen(true)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              سجل التغييرات
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsApprovalQueueOpen(true)}
              className="flex items-center gap-2"
            >
              <ClipboardCheck className="h-4 w-4" />
              الموافقات
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const entityTypeMap: Record<string, 'text' | 'image' | 'color' | 'seo'> = {
                  text: 'text',
                  images: 'image',
                  pages: 'text',
                  sections: 'text',
                  colors: 'color',
                  seo: 'seo',
                };
                setSelectedVersionEntityType(entityTypeMap[contentManagement.activeTab] || 'text');
                setIsVersionHistoryOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              تاريخ النسخ
            </Button>
          </div>
        </div>

        {homepageReadiness && !homepageReadiness.isReady && (
          <Alert className="border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>الصفحة الرئيسية غير مكتملة في إدارة المحتوى</AlertTitle>
            <AlertDescription>
              يوجد {homepageReadiness.missingKeys.length} عنصراً غير منشور من أصل{' '}
              {homepageReadiness.total}. سيستمر الموقع العام في استخدام القيم الاحتياطية لهذه
              العناصر إلى أن تُنشَر من هنا.
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <ContentOverviewCards
          overview={contentManagement.overview}
          isLoading={contentManagement.loadingOverview}
        />

        {/* Import/Export */}
        <ContentImportExport
          onExport={importExport.handleExport}
          onImport={importExport.handleImport}
        />

        {/* Content Tabs */}
        <ContentTabs
          activeTab={contentManagement.activeTab}
          onTabChange={contentManagement.setActiveTab}
        >
          {contentManagement.activeTab === 'text' && (
            <TextContentList
              textContents={textContent.textContents || []}
              isLoading={textContent.loadingTextContents}
              pagination={textContent.pagination}
              currentPage={textContent.page}
              onPageChange={textContent.setPage}
              filters={{
                searchQuery: textContent.searchQuery,
                language: textContent.language,
                section: textContent.section,
                type: textContent.type || 'all',
                isActive: textContent.isActive || 'all',
              }}
              onFiltersChange={(filters) => {
                textContent.setSearchQuery(filters.searchQuery);
                textContent.setLanguage(filters.language);
                textContent.setSection(filters.section);
                textContent.setType(filters.type || 'all');
                textContent.setIsActive(filters.isActive || 'all');
                textContent.setPage(1);
              }}
              pages={
                Array.isArray(pages.pages)
                  ? pages.pages.map((p) => ({
                      id: p.id,
                      name: p.name,
                      titleAr: p.titleAr,
                      titleEn: p.titleEn,
                    }))
                  : []
              }
              sections={
                Array.isArray(sections.sections)
                  ? sections.sections.map((s) => ({
                      id: s.id,
                      pageId: s.pageId,
                      name: s.name,
                      titleAr: s.titleAr,
                      titleEn: s.titleEn,
                    }))
                  : []
              }
              isCreateDialogOpen={textContent.isCreateDialogOpen}
              isEditDialogOpen={textContent.isEditDialogOpen}
              selectedTextContent={textContent.selectedTextContent}
              formData={textContent.formData}
              onFormDataChange={textContent.setFormData}
              onCreateDialogOpen={textContent.setIsCreateDialogOpen}
              onEditDialogOpen={textContent.setIsEditDialogOpen}
              onEditTextContent={textContent.handleEditTextContent}
              onCreateTextContent={textContent.handleCreateTextContent}
              openEditDialog={textContent.openEditDialog}
              handleDeleteTextContent={textContent.handleDeleteTextContent}
              onVersionHistory={(id) => {
                setSelectedVersionEntityType('text');
                setSelectedVersionEntityId(id);
                setIsVersionHistoryOpen(true);
              }}
              createMutation={textContent.createMutation}
              updateMutation={textContent.updateMutation}
            />
          )}
          {contentManagement.activeTab === 'images' && (
            <div className="space-y-4">
              <BulkImageUpload
                onUpload={async (files) => {
                  const formData = new FormData();
                  files.forEach((file) => formData.append('files', file));
                  formData.append('folder', 'uploads');
                  const response = await fetch('/api/upload/batch', {
                    method: 'POST',
                    body: formData,
                  });
                  const result = await response.json().catch(() => null);
                  if (!response.ok) {
                    throw new Error(result?.error || 'فشل رفع الصور');
                  }
                  await images.refetch();
                }}
              />
              <ImageList
                images={images.images || []}
                isLoading={images.loadingImages}
                filters={{
                  searchQuery: images.searchQuery,
                  language: 'all',
                  section: images.section,
                  type: images.format,
                  isActive: images.isActive,
                }}
                onFiltersChange={(filters) => {
                  images.setSearchQuery(filters.searchQuery);
                  images.setSection(filters.section);
                  images.setFormat(filters.type || 'all');
                  images.setIsActive(filters.isActive || 'all');
                }}
                isCreateDialogOpen={images.isCreateDialogOpen}
                isEditDialogOpen={images.isEditDialogOpen}
                selectedImage={images.selectedImage}
                formData={images.formData}
                onFormDataChange={images.setFormData}
                onCreateDialogOpen={images.setIsCreateDialogOpen}
                onEditDialogOpen={images.setIsEditDialogOpen}
                onEditImage={images.handleEditImage}
                onCreateImage={images.handleCreateImage}
                openEditDialog={images.openEditDialog}
                handleDeleteImage={images.handleDeleteImage}
                onVersionHistory={(id) => {
                  setSelectedVersionEntityType('image');
                  setSelectedVersionEntityId(id);
                  setIsVersionHistoryOpen(true);
                }}
                createMutation={images.createMutation}
                updateMutation={images.updateMutation}
              />
            </div>
          )}
          {contentManagement.activeTab === 'pages' && (
            <PagesList
              pages={Array.isArray(pages.pages) ? pages.pages : []}
              isLoading={pages.loadingPages}
              pagination={pages.pagination}
              currentPage={pages.page}
              onPageChange={pages.setPage}
              filters={{
                searchQuery: pages.searchQuery || '',
                language: 'all',
                section: 'all',
                type: pages.type || 'all',
                isActive: pages.isActive || 'all',
              }}
              onFiltersChange={(filters) => {
                pages.setSearchQuery(filters.searchQuery);
                if (filters.type === 'all' || filters.type === 'main' || filters.type === 'sub') {
                  pages.setType(filters.type);
                }
                if (
                  filters.isActive === 'all' ||
                  filters.isActive === 'yes' ||
                  filters.isActive === 'no'
                ) {
                  pages.setIsActive(filters.isActive);
                }
                pages.setPage(1);
              }}
              handlePageSettings={handlePageSettings}
              openEditDialog={pages.openEditDialog}
              handleDeletePage={pages.handleDeletePage}
              handleDuplicatePage={pages.handleDuplicatePage}
              onCreateDialogOpen={pages.setIsCreateDialogOpen}
              pageSections={Array.isArray(sections.sections) ? sections.sections : []}
            />
          )}
          {contentManagement.activeTab === 'sections' && (
            <SectionsList
              sections={sections.sections || []}
              isLoading={sections.loadingSections}
              pagination={sections.pagination}
              currentPage={sections.page}
              onPageChange={sections.setPage}
              filters={{
                searchQuery: sections.searchQuery || '',
                language: 'all',
                section: 'all',
                type: sections.type || 'all',
                isActive: sections.isActive || 'all',
              }}
              onFiltersChange={(filters) => {
                sections.setSearchQuery(filters.searchQuery);
                sections.setType(filters.type || 'all');
                if (
                  filters.isActive === 'all' ||
                  filters.isActive === 'yes' ||
                  filters.isActive === 'no'
                ) {
                  sections.setIsActive(filters.isActive);
                }
                sections.setPage(1);
              }}
              pages={
                Array.isArray(pages.pages)
                  ? pages.pages.map((p) => ({
                      id: p.id,
                      name: p.name,
                      titleAr: p.titleAr,
                      titleEn: p.titleEn,
                    }))
                  : []
              }
              openEditDialog={sections.openEditDialog}
              handleDeleteSection={sections.handleDeleteSection}
              handleDuplicateSection={sections.handleDuplicateSection}
              handleReorderSections={sections.handleReorderSections}
              onCreateDialogOpen={sections.setIsCreateDialogOpen}
            />
          )}
          {contentManagement.activeTab === 'sectionButtons' && (
            <SectionButtonsList
              sectionButtons={sectionButtons.sectionButtons || []}
              isLoading={sectionButtons.loadingSectionButtons}
              filters={{
                searchQuery: sectionButtons.searchQuery || '',
                language: 'all',
                section: 'all',
                type: sectionButtons.style || 'all',
                isActive: sectionButtons.isActive || 'all',
              }}
              onFiltersChange={(filters) => {
                sectionButtons.setSearchQuery(filters.searchQuery);
                sectionButtons.setStyle(filters.type || 'all');
                if (
                  filters.isActive === 'all' ||
                  filters.isActive === 'yes' ||
                  filters.isActive === 'no'
                ) {
                  sectionButtons.setIsActive(filters.isActive);
                }
              }}
              openEditDialog={sectionButtons.openEditDialog}
              handleDeleteButton={sectionButtons.handleDeleteButton}
              onCreateDialogOpen={sectionButtons.setIsCreateDialogOpen}
            />
          )}
          {contentManagement.activeTab === 'colors' && (
            <ColorSchemeList
              colorSchemes={colorScheme.colorSchemes || []}
              isLoading={colorScheme.loadingColorSchemes}
              filters={{
                searchQuery: colorScheme.searchQuery,
                language: 'all',
                section: 'all',
                type: colorScheme.type,
                isActive: colorScheme.isActive,
              }}
              onFiltersChange={(filters) => {
                colorScheme.setSearchQuery(filters.searchQuery);
                colorScheme.setType(filters.type || 'all');
                colorScheme.setShade(filters.section);
                colorScheme.setIsActive(filters.isActive || 'all');
              }}
              isCreateDialogOpen={colorScheme.isCreateDialogOpen}
              isEditDialogOpen={colorScheme.isEditDialogOpen}
              selectedColorScheme={colorScheme.selectedColorScheme}
              formData={colorScheme.formData}
              onFormDataChange={colorScheme.setFormData}
              onCreateDialogOpen={colorScheme.setIsCreateDialogOpen}
              onEditDialogOpen={colorScheme.setIsEditDialogOpen}
              onEditColorScheme={colorScheme.handleEditColorScheme}
              onCreateColorScheme={colorScheme.handleCreateColorScheme}
              openEditDialog={colorScheme.openEditDialog}
              handleDeleteColorScheme={colorScheme.handleDeleteColorScheme}
              onVersionHistory={(id) => {
                setSelectedVersionEntityType('color');
                setSelectedVersionEntityId(id);
                setIsVersionHistoryOpen(true);
              }}
              createMutation={colorScheme.createMutation}
              updateMutation={colorScheme.updateMutation}
            />
          )}
          {contentManagement.activeTab === 'seo' && (
            <SEOList
              seoSettings={seo.seoSettings || []}
              isLoading={seo.loadingSEOSettings}
              pages={
                Array.isArray(pages.pages)
                  ? pages.pages.map((page) => ({
                      id: page.id,
                      name: page.name,
                      slug: page.slug,
                      titleAr: page.titleAr,
                      titleEn: page.titleEn,
                    }))
                  : []
              }
              filters={{
                searchQuery: seo.searchQuery,
                language: seo.language,
                section: 'all',
                type: 'all',
                isActive: seo.isActive,
              }}
              onFiltersChange={(filters) => {
                seo.setSearchQuery(filters.searchQuery);
                seo.setLanguage(filters.language);
                seo.setIsActive(filters.isActive || 'all');
              }}
              isCreateDialogOpen={seo.isCreateDialogOpen}
              isEditDialogOpen={seo.isEditDialogOpen}
              selectedSEOSettings={seo.selectedSEOSettings}
              formData={seo.formData}
              onFormDataChange={seo.setFormData}
              onCreateDialogOpen={seo.setIsCreateDialogOpen}
              onEditDialogOpen={seo.setIsEditDialogOpen}
              onEditSEOSettings={seo.handleEditSEOSettings}
              onCreateSEOSettings={seo.handleCreateSEOSettings}
              openEditDialog={seo.openEditDialog}
              handleDeleteSEOSettings={seo.handleDeleteSEOSettings}
              onVersionHistory={(id) => {
                setSelectedVersionEntityType('seo');
                setSelectedVersionEntityId(id);
                setIsVersionHistoryOpen(true);
              }}
              createMutation={seo.createMutation}
              updateMutation={seo.updateMutation}
            />
          )}
        </ContentTabs>
      </div>

      {/* Preview Panel */}
      <ContentPreviewPanel
        textContents={textContent.textContents || []}
        images={images.images || []}
        colorSchemes={colorScheme.colorSchemes || []}
        pages={pages.pages || []}
        sections={sections.sections || []}
        isVisible={isPreviewVisible}
        onToggle={() => setIsPreviewVisible(!isPreviewVisible)}
        onRefresh={() => {
          textContent.refetch();
          images.refetch();
          colorScheme.refetch();
          seo.refetch();
          pages.refetch();
          sections.refetch();
        }}
        language={previewLanguage}
      />

      {/* Version History Dialog */}
      <VersionHistoryDialog
        open={isVersionHistoryOpen}
        onOpenChange={setIsVersionHistoryOpen}
        entityType={selectedVersionEntityType}
        entityId={selectedVersionEntityId}
        onRestore={() => {
          textContent.refetch();
          images.refetch();
          colorScheme.refetch();
          seo.refetch();
        }}
      />

      {/* Audit Log Dialog */}
      <AuditLogDialog open={isAuditLogOpen} onOpenChange={setIsAuditLogOpen} />

      <ApprovalQueueDialog open={isApprovalQueueOpen} onOpenChange={setIsApprovalQueueOpen} />

      {/* Page Dialog */}
      <PageDialog
        open={pages.isCreateDialogOpen || pages.isEditDialogOpen}
        onOpenChange={(open) => {
          pages.setIsCreateDialogOpen(open);
          pages.setIsEditDialogOpen(open);
        }}
        mode={pages.isEditDialogOpen ? 'edit' : 'create'}
        formData={pages.formData}
        onFormDataChange={pages.setFormData}
        onSubmit={pages.isEditDialogOpen ? pages.handleEditPage : pages.handleCreatePage}
        isPending={pages.createMutation.isPending || pages.updateMutation.isPending}
        mainPages={pages.mainPages}
      />

      {/* Section Dialog */}
      <SectionDialog
        open={sections.isCreateDialogOpen || sections.isEditDialogOpen}
        onOpenChange={(open) => {
          sections.setIsCreateDialogOpen(open);
          sections.setIsEditDialogOpen(open);
        }}
        mode={sections.isEditDialogOpen ? 'edit' : 'create'}
        formData={sections.formData}
        onFormDataChange={sections.setFormData}
        onSubmit={
          sections.isEditDialogOpen ? sections.handleEditSection : sections.handleCreateSection
        }
        isPending={sections.createMutation.isPending || sections.updateMutation.isPending}
        pages={sections.pages}
      />

      {/* Page Settings Dialog */}
      <PageSettingsDialog
        open={isPageSettingsOpen}
        onOpenChange={setIsPageSettingsOpen}
        page={pages.pages?.find((p: Page) => p.id === selectedPageForSettings) || null}
        onNavigateToTab={handleNavigateToTab}
      />
    </DashboardLayout>
  );
}
