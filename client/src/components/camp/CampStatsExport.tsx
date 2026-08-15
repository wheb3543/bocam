import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '@/_core/hooks/useAuth';
import { APP_LOGO, COMPANY_PHONE, COMPANY_ARABIC_NAME } from '@/const';
import { getCompanySlogan } from '@/const';

interface CampStatsExportProps {
  selectedCamp: string;
  camps?: Array<{ id: number; name: string }>;
  stats: {
    totalRegistrations: number;
    pendingCount: number;
    confirmedCount: number;
    attendedCount: number;
    cancelledCount: number;
    completedCount: number;
    contactedCount: number;
    noAnswerCount: number;
    attendanceRate: number;
    cancellationRate: number;
  };
  statusData: Array<{ name: string; value: number }>;
  ageData: Array<{ name: string; value: number }>;
  genderData: Array<{ name: string; value: number }>;
  sourceData: Array<{ name: string; value: number }>;
  procedureData: Array<{ name: string; value: number }>;
  registrations: unknown[];
  timeMetrics: { avgToConfirm: number; avgToAttend: number; avgToCancel: number };
}

export default function CampStatsExport({
  selectedCamp,
  camps,
  stats,
  statusData,
  ageData,
  genderData,
  sourceData,
  procedureData,
  registrations,
  timeMetrics,
}: CampStatsExportProps) {
  const { user } = useAuth();

  const handleExport = () => {
    const data = {
      camp: selectedCamp === 'all' ? 'all' : camps?.find((c) => c.id?.toString() === selectedCamp)?.name,
      statistics: {
        total: stats.totalRegistrations,
        pending: stats.pendingCount,
        confirmed: stats.confirmedCount,
        attended: stats.attendedCount,
        cancelled: stats.cancelledCount,
      },
      statusDistribution: statusData,
      ageDistribution: ageData,
      sourceDistribution: sourceData,
      popularProcedures: procedureData,
      registrations,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camp-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تصدير البيانات بنجاح');
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=1200');

    if (!printWindow) {
      toast.error('تعذر فتح نافذة الطباعة. الرجاء السماح بالنوافذ المنبثقة.');
      return;
    }

    const campName =
      selectedCamp === 'all'
        ? 'جميع المخيمات'
        : camps?.find((c) => c.id?.toString() === selectedCamp)?.name || 'غير محدد';
    const printDate = new Date();
    const userName = user?.name || 'غير محدد';

    const reportHTML = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير إحصائيات المخيمات</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none !important;
            }
          }
          
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            margin: 0;
            padding: 20px;
            background-color: white;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #00a651;
          }
          
          .header img {
            height: 50px;
            max-width: 150px;
            object-fit: contain;
          }
          
          .header .phone {
            font-size: 24px;
            font-weight: bold;
            color: #00a651;
          }
          
          .report-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
          }
          
          .report-subtitle {
            text-align: center;
            font-size: 16px;
            color: #666;
            margin-bottom: 25px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 25px;
          }
          
          .stat-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #333;
          }
          
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            border-bottom: 2px solid #00a651;
            padding-bottom: 8px;
          }
          
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          .data-table th,
          .data-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: right;
          }
          
          .data-table th {
            background-color: #00a651;
            color: white;
            font-weight: bold;
          }
          
          .data-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #00a651;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .slogan {
            font-size: 18px;
            font-weight: bold;
            color: #0088cc;
          }
          
          .meta {
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${APP_LOGO}" alt="${COMPANY_ARABIC_NAME}">
          <div class="phone">${COMPANY_PHONE}</div>
        </div>
        
        <div class="report-title">تقرير إحصائيات المخيمات</div>
        <div class="report-subtitle">${campName} - ${format(printDate, 'dd/MM/yyyy HH:mm', { locale: ar })}</div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">إجمالي التسجيلات</div>
            <div class="stat-value">${stats.totalRegistrations}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">قيد الانتظار</div>
            <div class="stat-value">${stats.pendingCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">مؤكد</div>
            <div class="stat-value">${stats.confirmedCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">حضر</div>
            <div class="stat-value">${stats.attendedCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">مكتمل</div>
            <div class="stat-value">${stats.completedCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">ملغي</div>
            <div class="stat-value">${stats.cancelledCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">معدل الحضور</div>
            <div class="stat-value">${stats.attendanceRate}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">معدل الإلغاء</div>
            <div class="stat-value">${stats.cancellationRate}%</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">توزيع الحالات</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>الحالة</th>
                <th>العدد</th>
                <th>النسبة</th>
              </tr>
            </thead>
            <tbody>
              ${statusData
                .map((item) => {
                  const percentage =
                    stats.totalRegistrations > 0
                      ? Math.round((item.value / stats.totalRegistrations) * 100)
                      : 0;
                  return `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.value}</td>
                    <td>${percentage}%</td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">توزيع الأعمار</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>الفئة العمرية</th>
                <th>العدد</th>
              </tr>
            </thead>
            <tbody>
              ${ageData
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.value}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">توزيع الجنس</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>الجنس</th>
                <th>العدد</th>
                <th>النسبة</th>
              </tr>
            </thead>
            <tbody>
              ${genderData
                .map((item) => {
                  const total = genderData.reduce((sum, g) => sum + g.value, 0);
                  const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.value}</td>
                    <td>${percentage}%</td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">مقاييس الوقت</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>المقياس</th>
                <th>القيمة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>متوسط وقت التأكيد</td>
                <td>${timeMetrics.avgToConfirm} يوم</td>
              </tr>
              <tr>
                <td>متوسط وقت الحضور</td>
                <td>${timeMetrics.avgToAttend} يوم</td>
              </tr>
              <tr>
                <td>متوسط وقت الإلغاء</td>
                <td>${timeMetrics.avgToCancel} يوم</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <div class="slogan">${getCompanySlogan()}</div>
          <div class="meta">
            <div>المستخدم: ${userName}</div>
            <div>${format(printDate, 'dd/MM/yyyy HH:mm', { locale: ar })}</div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 1000);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        تصدير
      </Button>
      <Button variant="outline" onClick={handlePrintReport}>
        <Printer className="mr-2 h-4 w-4" />
        طباعة
      </Button>
    </div>
  );
}
