/**
 * Sections List Component
 * مكون قائمة الأقسام
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionCard, SectionPreview } from './index';
import { ContentFiltersComponent } from './ContentFilters';
import { Plus, GripVertical } from 'lucide-react';
import { useState } from 'react';
import type { Section } from '../hooks/useSections';
import type { ContentFilters } from '../types/content.types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SectionsListProps {
  sections: Section[];
  isLoading: boolean;
  filters?: ContentFilters;
  onFiltersChange?: (filters: ContentFilters) => void;
  pages?: Array<{ id: number; name: string; titleAr: string; titleEn: string }>;
  openEditDialog: (section: Section) => void;
  handleDeleteSection: (id: number) => void;
  handleDuplicateSection?: (id: number) => void;
  handleReorderSections?: (sections: Section[]) => void;
  onCreateDialogOpen: (open: boolean) => void;
}

/**
 * SortableSectionCard - مكون البطاقة القابلة للسحب
 */
function SortableSectionCard({
  section,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
}: {
  section: Section;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onPreview: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="relative p-4 hover:shadow-lg transition-shadow">
        {/* Drag Handle */}
        <div
          {...listeners}
          className="absolute top-2 right-2 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>

        <SectionCard
          section={section}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onPreview={onPreview}
        />
      </Card>
    </div>
  );
}

/**
 * SectionsList - مكون قائمة الأقسام
 */
export function SectionsList({
  sections,
  isLoading,
  filters,
  onFiltersChange,
  pages = [],
  openEditDialog,
  handleDeleteSection,
  handleDuplicateSection,
  handleReorderSections,
  onCreateDialogOpen,
}: SectionsListProps) {
  const [previewSection, setPreviewSection] = useState<Section | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handlePreview = (section: Section) => {
    setPreviewSection(section);
    setIsPreviewOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && handleReorderSections) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over.id);

      const reorderedSections = arrayMove(sections, oldIndex, newIndex);

      // تحديث sortOrder بناءً على الترتيب الجديد
      const updatedSections = reorderedSections.map((section, index) => ({
        ...section,
        sortOrder: index,
      }));

      handleReorderSections(updatedSections);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الأقسام</h2>
        <Button onClick={() => onCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة قسم
        </Button>
      </div>

      {/* Filters */}
      {filters && onFiltersChange && (
        <ContentFiltersComponent
          filters={filters}
          onFiltersChange={onFiltersChange}
          type="sections"
          pages={pages}
        />
      )}

      {/* Content List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48 animate-pulse" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">لا توجد أقسام حالياً</p>
          <Button onClick={() => onCreateDialogOpen(true)} className="mt-4" variant="outline">
            إضافة قسم جديد
          </Button>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  onEdit={() => openEditDialog(section)}
                  onDelete={() => handleDeleteSection(section.id)}
                  onDuplicate={
                    handleDuplicateSection ? () => handleDuplicateSection(section.id) : undefined
                  }
                  onPreview={() => handlePreview(section)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Preview Dialog */}
      <SectionPreview
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        section={previewSection}
      />

      {/* Dialogs */}
      {/* سيتم إضافة Dialogs لاحقاً */}
    </div>
  );
}
