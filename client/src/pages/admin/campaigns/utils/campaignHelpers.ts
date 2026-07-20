/**
 * Campaign Helpers
 * دوال مساعدة للحملات التسويقية
 */

import React from 'react';
import { Clock, CheckCircle, PauseCircle, XCircle } from 'lucide-react';
import type { Campaign } from '../types/campaign.types';

export const getCampaignTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    digital: 'رقمية',
    field: 'ميدانية',
    awareness: 'توعوية',
    mixed: 'مختلطة',
  };
  return labels[type] || type;
};

export const getCampaignStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'مسودة',
    active: 'نشطة',
    paused: 'متوقفة',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-muted text-foreground',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-muted text-foreground';
};

export const getStatusIcon = (status: string) => {
  const icons: Record<string, React.ReactNode> = {
    draft: React.createElement(Clock, { className: 'h-4 w-4' }),
    active: React.createElement(CheckCircle, { className: 'h-4 w-4' }),
    paused: React.createElement(PauseCircle, { className: 'h-4 w-4' }),
    completed: React.createElement(CheckCircle, { className: 'h-4 w-4' }),
    cancelled: React.createElement(XCircle, { className: 'h-4 w-4' }),
  };
  return icons[status] || React.createElement(Clock, { className: 'h-4 w-4' });
};

export const calculateProgress = (campaign: Campaign) => {
  if (!campaign.targetLeads || campaign.targetLeads === 0) {
    return 0;
  }
  const actualLeads = campaign.actualLeads || 0;
  return Math.min(100, Math.round((actualLeads / campaign.targetLeads) * 100));
};
