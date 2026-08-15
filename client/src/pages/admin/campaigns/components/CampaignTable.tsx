/**
 * CampaignTable - جدول الحملات
 */

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Edit, Trash2, Loader2, Megaphone, Plus } from 'lucide-react';
import { format } from 'date-fns';
import type { Campaign } from '../types/campaign.types';
import {
  getCampaignTypeLabel,
  getCampaignStatusLabel,
  getStatusColor,
  getStatusIcon,
  calculateProgress,
} from '../utils/campaignHelpers';

interface CampaignTableProps {
  campaigns: Campaign[] | undefined;
  isLoading: boolean;
  onView: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
}

export function CampaignTable({
  campaigns,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onCreate,
}: CampaignTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6 sm:py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <Megaphone className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-muted-foreground mb-4">لا توجد حملات</p>
        <Button onClick={onCreate}>
          <Plus className="ml-2 h-4 w-4" />
          إنشاء أول حملة
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto -mx-4 sm:mx-0">
      <Table>
        <TableHeader>
          <TableRow className="text-xs sm:text-sm">
            <TableHead className="text-right min-w-[150px]">الحملة</TableHead>
            <TableHead className="text-right min-w-[80px]">النوع</TableHead>
            <TableHead className="text-right min-w-[90px]">الحالة</TableHead>
            <TableHead className="text-right hidden md:table-cell min-w-[100px]">
              الميزانية
            </TableHead>
            <TableHead className="text-right hidden lg:table-cell min-w-[120px]">
              التقدم
            </TableHead>
            <TableHead className="text-right hidden md:table-cell min-w-[100px]">
              الفترة
            </TableHead>
            <TableHead className="text-right min-w-[100px]">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign: Campaign) => (
            <TableRow key={campaign.id} className="hover:bg-muted/50">
              <TableCell>
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  {campaign.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {campaign.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getCampaignTypeLabel(campaign.type)}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={`${getStatusColor(campaign.status)} flex items-center gap-1 w-fit`}
                >
                  {getStatusIcon(campaign.status)}
                  {getCampaignStatusLabel(campaign.status)}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="text-sm">
                  <div>مخطط: {campaign.plannedBudget?.toLocaleString() || 0}</div>
                  <div className="text-muted-foreground">
                    فعلي: {campaign.actualBudget?.toLocaleString() || 0}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="w-32">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{calculateProgress(campaign)}%</span>
                    <span>
                      {campaign.actualLeads || 0}/{campaign.targetLeads || 0}
                    </span>
                  </div>
                  <Progress value={calculateProgress(campaign)} className="h-2" />
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="text-sm">
                  {campaign.startDate && (
                    <div>{format(new Date(campaign.startDate), 'dd/MM/yyyy')}</div>
                  )}
                  {campaign.endDate && (
                    <div className="text-muted-foreground">
                      إلى {format(new Date(campaign.endDate), 'dd/MM/yyyy')}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(campaign)}
                    title="عرض التفاصيل"
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(campaign)}
                    title="تعديل"
                  >
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(campaign.id)}
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
