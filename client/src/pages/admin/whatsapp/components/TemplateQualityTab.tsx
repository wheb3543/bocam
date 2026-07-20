/**
 * TemplateQualityTab - تبويب جودة القوالب
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart2 } from 'lucide-react';
import type { WhatsappTemplateQuality } from '@shared/types';
import type { Template } from '../types/template.types';

interface TemplateQualityTabProps {
  templates: Template[] | undefined;
  selectedTemplateForQuality: string;
  onSelectedTemplateChange: (value: string) => void;
  qualityData: WhatsappTemplateQuality[] | undefined;
  isLoading: boolean;
}

export function TemplateQualityTab({
  templates,
  selectedTemplateForQuality,
  onSelectedTemplateChange,
  qualityData,
  isLoading,
}: TemplateQualityTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          جودة القوالب
        </CardTitle>
        <CardDescription>مراقبة جودة القوالب وأدائها</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">اختر قالباً</label>
          <Select
            value={selectedTemplateForQuality}
            onValueChange={onSelectedTemplateChange}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="اختر قالباً لعرض جودته" />
            </SelectTrigger>
            <SelectContent>
              {templates?.map((t: Template) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : qualityData && qualityData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4">التاريخ</th>
                  <th className="text-right py-3 px-4">معرف القالب</th>
                  <th className="text-right py-3 px-4">درجة الجودة</th>
                  <th className="text-right py-3 px-4">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {qualityData.map((record: WhatsappTemplateQuality) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(record.createdAt).toLocaleString('ar-SA')}
                    </td>
                    <td className="py-3 px-4">{record.templateId}</td>
                    <td className="py-3 px-4">{record.qualityScore || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {record.details && (
                        <details>
                          <summary className="cursor-pointer text-blue-600">عرض</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(JSON.parse(record.details), null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {!selectedTemplateForQuality
              ? 'اختر قالباً لعرض جودته'
              : 'لا توجد بيانات جودة لهذا القالب'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
