import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Database, 
  HardDrive, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Trash2,
  Calendar,
  Cloud
} from "lucide-react";

interface BackupStatus {
  lastBackup: number;
  lastBackupSize: number;
  nextBackup: number;
  backupEnabled: boolean;
  cloudEnabled: boolean;
  retentionDays: number;
  totalBackups: number;
  totalSize: number;
}

interface BackupHistory {
  id: string;
  timestamp: number;
  type: 'daily' | 'weekly' | 'manual';
  size: number;
  status: 'completed' | 'failed' | 'in_progress';
  location: 'local' | 'cloud' | 'both';
}

export default function BackupManagementPage() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [history, setHistory] = useState<BackupHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    fetchBackupStatus();
    fetchBackupHistory();
  }, []);

  const fetchBackupStatus = async () => {
    try {
      const response = await fetch('/api/backup/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch backup status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBackupHistory = async () => {
    try {
      const response = await fetch('/api/backup/history');
      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch backup history:', error);
    }
  };

  const handleCreateBackup = async () => {
    if (!confirm('هل أنت متأكد من أنك تريد إنشاء نسخة احتياطية يدوية؟')) {
      return;
    }

    try {
      setIsCreatingBackup(true);
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'manual' }),
      });
      const data = await response.json();
      
      if (data.success) {
        alert('تم بدء النسخة الاحتياطية بنجاح');
        fetchBackupStatus();
        fetchBackupHistory();
      } else {
        alert('فشل بدء النسخة الاحتياطية: ' + data.error);
      }
    } catch (error) {
      alert('فشل بدء النسخة الاحتياطية');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('هل أنت متأكد من أنك تريد استعادة هذه النسخة الاحتياطية؟ سيتم استعادة النظام إلى الحالة عند هذه النسخة.')) {
      return;
    }

    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupId }),
      });
      const data = await response.json();
      
      if (data.success) {
        alert('تم استعادة النسخة الاحتياطية بنجاح. سيتم إعادة تشغيل النظام.');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        alert('فشل استعادة النسخة الاحتياطية: ' + data.error);
      }
    } catch (error) {
      alert('فشل استعادة النسخة الاحتياطية');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('هل أنت متأكد من أنك تريد حذف هذه النسخة الاحتياطية؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    try {
      const response = await fetch(`/api/backup/${backupId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        alert('تم حذف النسخة الاحتياطية بنجاح');
        fetchBackupStatus();
        fetchBackupHistory();
      } else {
        alert('فشل حذف النسخة الاحتياطية: ' + data.error);
      }
    } catch (error) {
      alert('فشل حذف النسخة الاحتياطية');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ar-SA');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">مكتمل</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">جاري...</Badge>;
      default:
        return <Badge variant="secondary">غير معروف</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'daily':
        return <Badge variant="outline">يومي</Badge>;
      case 'weekly':
        return <Badge variant="outline">أسبوعي</Badge>;
      case 'manual':
        return <Badge variant="outline">يدوي</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const getLocationBadge = (location: string) => {
    switch (location) {
      case 'local':
        return <Badge variant="outline">محلي</Badge>;
      case 'cloud':
        return <Badge variant="outline">سحابي</Badge>;
      case 'both':
        return <Badge className="bg-blue-600">كلاهما</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="إدارة النسخ الاحتياطية" pageDescription="إدارة النسخ الاحتياطية للنظام">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="إدارة النسخ الاحتياطية" pageDescription="إدارة النسخ الاحتياطية للنظام">
      <div className="space-y-6">
        {/* Backup Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                آخر نسخة احتياطية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {status?.lastBackup ? formatDate(status.lastBackup) : 'غير متوفر'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                الحجم: {status?.lastBackupSize ? formatBytes(status.lastBackupSize * 1024 * 1024) : '0'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                النسخة القادمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {status?.nextBackup ? formatDate(status.nextBackup) : 'غير محدد'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                مجدول تلقائياً
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                إجمالي النسخ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {status?.totalBackups || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                الاحتفاظ: {status?.retentionDays || 0} يوم
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                إجمالي الحجم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {status?.totalSize ? formatBytes(status.totalSize * 1024 * 1024) : '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {status?.cloudEnabled ? 'متصل بالسحابة' : 'محلي فقط'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Backup Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>إعدادات النسخ الاحتياطي</CardTitle>
                <CardDescription>تكوين النسخ الاحتياطي التلقائي</CardDescription>
              </div>
              <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
                {isCreatingBackup ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    نسخ احتياطي يدوي
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">النسخ الاحتياطي التلقائي</p>
                    <p className="text-sm text-muted-foreground">يومي الساعة 2:00 ص</p>
                  </div>
                </div>
                {status?.backupEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Cloud className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">التخزين السحابي</p>
                    <p className="text-sm text-muted-foreground">AWS S3 / R2</p>
                  </div>
                </div>
                {status?.cloudEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5" />
                <div>
                  <p className="font-semibold">سياسة الاحتفاظ</p>
                  <p className="text-sm text-muted-foreground">احتفاظ بالنسخ لمدة {status?.retentionDays || 0} يوم</p>
                </div>
              </div>
              <Badge variant="outline">{status?.retentionDays || 0} يوم</Badge>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Backup History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>سجل النسخ الاحتياطية</CardTitle>
                <CardDescription>تاريخ النسخ الاحتياطية السابقة</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                تحديث
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحجم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>{formatDate(backup.timestamp)}</TableCell>
                    <TableCell>{getTypeBadge(backup.type)}</TableCell>
                    <TableCell>{formatBytes(backup.size * 1024 * 1024)}</TableCell>
                    <TableCell>{getStatusBadge(backup.status)}</TableCell>
                    <TableCell>{getLocationBadge(backup.location)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={backup.status !== 'completed'}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteBackup(backup.id)}
                          disabled={backup.status === 'in_progress'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">معلومات مهمة</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                النسخ الاحتياطية التلقائية تعمل يومياً الساعة 2:00 ص. يتم الاحتفاظ بالنسخ لمدة 30 يوم ثم يتم حذفها تلقائياً.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
