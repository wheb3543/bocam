import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  Info,
} from 'lucide-react';

interface UpdateStatus {
  lastCheck: number;
  pendingUpdate: {
    version: string;
    mandatory: boolean;
    releaseNotes: string;
    size: number;
  } | null;
  updateInProgress: boolean;
  downloadPath: string | null;
  backupPath: string | null;
  updateProgress: number;
  updateStatus: 'idle' | 'downloading' | 'installing' | 'completed' | 'failed' | 'rolling_back';
  updateError: string | null;
}

export default function UpdateManagementPage() {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    fetchUpdateStatus();
    const interval = setInterval(fetchUpdateStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUpdateStatus = async () => {
    try {
      const response = await fetch('/api/update/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);

        // Update installing state
        setIsInstalling(data.data.updateInProgress);

        // Reload if update completed
        if (data.data.updateStatus === 'completed') {
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Failed to fetch update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      const response = await fetch('/api/update/install', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // Update will start, modal will show progress
        fetchUpdateStatus();
      } else {
        alert('فشل بدء التحديث: ' + data.error);
        setIsInstalling(false);
      }
    } catch (error) {
      alert('فشل بدء التحديث: ' + error);
      setIsInstalling(false);
    }
  };

  const handleRollback = async () => {
    if (!confirm('هل أنت متأكد من أنك تريد التراجع عن التحديث؟ سيتم استعادة النسخة السابقة.')) {
      return;
    }

    try {
      setIsRollingBack(true);
      const response = await fetch('/api/update/rollback', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        fetchUpdateStatus();
      } else {
        alert('فشل التراجع: ' + data.error);
        setIsRollingBack(false);
      }
    } catch (error) {
      alert('فشل التراجع: ' + error);
      setIsRollingBack(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) {return null;}

    if (status.updateInProgress) {
      return (
        <Badge variant="destructive" className="gap-2">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>
            {status.updateStatus === 'downloading' && 'جاري التنزيل'}
            {status.updateStatus === 'installing' && 'جاري التثبيت'}
            {status.updateStatus === 'rolling_back' && 'جاري التراجع'}
          </span>
        </Badge>
      );
    }

    if (status.pendingUpdate) {
      if (status.pendingUpdate.mandatory) {
        return (
          <Badge variant="destructive" className="gap-2">
            <AlertTriangle className="h-3 w-3" />
            <span>تحديث إجباري متاح</span>
          </Badge>
        );
      } else {
        return (
          <Badge variant="secondary" className="gap-2">
            <Download className="h-3 w-3" />
            <span>تحديث متاح</span>
          </Badge>
        );
      }
    }

    return (
      <Badge variant="default" className="gap-2 bg-green-600">
        <CheckCircle className="h-3 w-3" />
        <span>محدث</span>
      </Badge>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ar-SA');
  };

  return (
    <DashboardLayout pageTitle="إدارة التحديثات" pageDescription="إدارة تحديثات النظام">
      <div className="space-y-6">
        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>حالة التحديث</CardTitle>
                <CardDescription>
                  آخر فحص: {status?.lastCheck ? formatDate(status.lastCheck) : 'غير معروف'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUpdateStatus}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.updateInProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">التقدم:</span>
                  <span className="font-semibold">{status.updateProgress}%</span>
                </div>
                <Progress value={status.updateProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {status.updateStatus === 'downloading' && 'جاري تنزيل التحديث...'}
                  {status.updateStatus === 'installing' && 'جاري تثبيت التحديث...'}
                  {status.updateStatus === 'rolling_back' && 'جاري التراجع عن التحديث...'}
                </p>
              </div>
            )}

            {status?.updateError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">خطأ في التحديث</p>
                    <p className="text-sm text-destructive mt-1">{status.updateError}</p>
                  </div>
                </div>
              </div>
            )}

            {status?.pendingUpdate && !status.updateInProgress && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Info className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-semibold">الإصدار المتاح: {status.pendingUpdate.version}</p>
                    <p className="text-sm text-muted-foreground">
                      الحجم: {(status.pendingUpdate.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {status.pendingUpdate.releaseNotes && (
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-semibold mb-2">ملاحظات الإصدار:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {status.pendingUpdate.releaseNotes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className={status.pendingUpdate.mandatory ? 'flex-1' : ''}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {status.pendingUpdate.mandatory ? 'تثبيت التحديث الإجباري' : 'تثبيت التحديث'}
                  </Button>

                  {!status.pendingUpdate.mandatory && status.backupPath && (
                    <Button variant="outline" onClick={handleRollback} disabled={isRollingBack}>
                      <History className="h-4 w-4 mr-2" />
                      التراجع
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!status?.pendingUpdate && !status?.updateInProgress && (
              <div className="flex items-center justify-center gap-2 text-green-600 py-8">
                <CheckCircle className="h-8 w-8" />
                <div>
                  <p className="font-semibold">النظام محدث</p>
                  <p className="text-sm text-muted-foreground">لا توجد تحديثات متوفرة حالياً</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update History Card */}
        <Card>
          <CardHeader>
            <CardTitle>سجل التحديثات</CardTitle>
            <CardDescription>تاريخ التحديثات السابقة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>سجل التحديثات غير متوفر حالياً</p>
              <p className="text-sm mt-2">سيتم إضافة هذه الميزة في إصدار لاحق</p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات التحديث</CardTitle>
            <CardDescription>كيف يعمل نظام التحديث</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" />
                التحديثات الاختيارية
              </h4>
              <p className="text-sm text-muted-foreground">
                التحديثات الاختيارية يمكن تثبيتها في أي وقت. سيتم إنشاء نسخة احتياطية تلقائياً قبل
                التثبيت.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                التحديثات الإجبارية
              </h4>
              <p className="text-sm text-muted-foreground">
                التحديثات الإجبارية تتطلب التثبيت الفوري. سيتم تجميد الواجهة حتى اكتمال التحديث.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                التراجع عن التحديث
              </h4>
              <p className="text-sm text-muted-foreground">
                يمكن التراجع عن التحديث واستعادة النسخة السابقة في حالة وجود مشاكل.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
