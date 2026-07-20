/**
 * useCampaignManagement - Custom hook لإدارة الحملات التسويقية
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Campaign, CampaignFormData } from '../types/campaign.types';
import { initialFormData } from '../types/campaign.types';
import { useSlugGenerator } from '@/hooks/data/useSlugGenerator';

export function useCampaignManagement() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>(initialFormData);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Queries
  const {
    data: overview,
    isLoading: loadingOverview,
    refetch: refetchOverview,
  } = trpc.campaigns.getOverview.useQuery();

  const {
    data: campaigns,
    isLoading: loadingCampaigns,
    refetch,
  } = trpc.campaigns.list.useQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery || undefined,
  });

  // Mutations
  const createMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء الحملة بنجاح');
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      refetch();
      refetchOverview();
    },
    onError: (error) => {
      toast.error(`فشل إنشاء الحملة: ${error.message}`);
    },
  });

  const updateMutation = trpc.campaigns.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث الحملة بنجاح');
      setIsEditDialogOpen(false);
      setSelectedCampaign(null);
      setFormData(initialFormData);
      refetch();
      refetchOverview();
    },
    onError: (error) => {
      toast.error(`فشل تحديث الحملة: ${error.message}`);
    },
  });

  const deleteMutation = trpc.campaigns.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الحملة بنجاح');
      refetch();
      refetchOverview();
    },
    onError: (error) => {
      toast.error(`فشل حذف الحملة: ${error.message}`);
    },
  });

  // Slug auto-generation hook
  const { autoGenerateSlug: campaignAutoSlug } = useSlugGenerator(
    (slug) => setFormData((prev) => ({ ...prev, slug })),
    { isEditing: isEditDialogOpen }
  );

  // Handlers
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      type: formData.type as 'digital' | 'field' | 'awareness' | 'mixed',
      status: formData.status as 'draft' | 'active' | 'paused' | 'completed' | 'cancelled',
      plannedBudget: formData.plannedBudget ? Number(formData.plannedBudget) : undefined,
      actualBudget: formData.actualBudget ? Number(formData.actualBudget) : undefined,
      targetLeads: formData.targetLeads ? Number(formData.targetLeads) : undefined,
      targetBookings: formData.targetBookings ? Number(formData.targetBookings) : undefined,
      targetRevenue: formData.targetRevenue ? Number(formData.targetRevenue) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      platforms: formData.platforms.length > 0 ? formData.platforms.join(',') : undefined,
      teamMembers: formData.teamMembers || undefined,
      kpis: formData.kpis || undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleEditCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) {
      return;
    }

    updateMutation.mutate({
      id: selectedCampaign.id,
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type as 'digital' | 'field' | 'awareness' | 'mixed',
      status: formData.status as 'draft' | 'active' | 'paused' | 'completed' | 'cancelled',
      plannedBudget: formData.plannedBudget ? Number(formData.plannedBudget) : undefined,
      actualBudget: formData.actualBudget ? Number(formData.actualBudget) : undefined,
      targetLeads: formData.targetLeads ? Number(formData.targetLeads) : undefined,
      targetBookings: formData.targetBookings ? Number(formData.targetBookings) : undefined,
      targetRevenue: formData.targetRevenue ? Number(formData.targetRevenue) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      platforms: formData.platforms.length > 0 ? formData.platforms.join(',') : undefined,
      teamMembers: formData.teamMembers || undefined,
      kpis: formData.kpis || undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleDeleteCampaign = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذه الحملة؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const openEditDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name || '',
      slug: campaign.slug || '',
      description: campaign.description || '',
      type: campaign.type || 'digital',
      status: campaign.status || 'draft',
      plannedBudget: campaign.plannedBudget?.toString() || '',
      actualBudget: campaign.actualBudget?.toString() || '',
      targetLeads: campaign.targetLeads?.toString() || '',
      targetBookings: campaign.targetBookings?.toString() || '',
      targetRevenue: campaign.targetRevenue?.toString() || '',
      startDate: campaign.startDate ? format(new Date(campaign.startDate), 'yyyy-MM-dd') : '',
      endDate: campaign.endDate ? format(new Date(campaign.endDate), 'yyyy-MM-dd') : '',
      platforms: campaign.platforms ? campaign.platforms.split(',') : [],
      teamMembers: campaign.teamMembers || '',
      kpis: campaign.kpis || '',
      notes: campaign.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsViewDialogOpen(true);
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedCampaign(null);
  };

  return {
    // State
    isCreateDialogOpen,
    isEditDialogOpen,
    isViewDialogOpen,
    selectedCampaign,
    formData,
    searchQuery,
    statusFilter,
    typeFilter,
    overview,
    loadingOverview,
    campaigns,
    loadingCampaigns,
    createMutation,
    updateMutation,
    deleteMutation,

    // Setters
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsViewDialogOpen,
    setSelectedCampaign,
    setFormData,
    setSearchQuery,
    setStatusFilter,
    setTypeFilter,

    // Handlers
    handleCreateCampaign,
    handleEditCampaign,
    handleDeleteCampaign,
    openEditDialog,
    openViewDialog,
    handlePlatformToggle,
    resetForm,
    campaignAutoSlug,

    // Refetch
    refetch,
    refetchOverview,
  };
}
