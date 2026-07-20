import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download, RefreshCw, CheckCircle } from 'lucide-react';

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

interface MandatoryUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MandatoryUpdateModal({ open, onOpenChange }: MandatoryUpdateModalProps) {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUpdateStatus();
      const interval = setInterval(fetchUpdateStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const fetchUpdateStatus = async () => {
    try {
      const response = await fetch('/api/update/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);

        // If update is in progress, show progress
        if (data.data.updateInProgress) {
          setIsInstalling(true);
        }

        // If update is completed, reload
        if (data.data.updateStatus === 'completed') {
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      }
    } catch {
      // Silently handle update status fetch errors
    }
  };

  const startUpdate = async () => {
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
        setIsInstalling(false);
        // eslint-disable-next-line no-alert -- Intentional user notification
        alert('فشل بدء التحديث: ' + data.error);
      }
    } catch (error) {
      setIsInstalling(false);
      // eslint-disable-next-line no-alert -- Intentional user notification
      alert('فشل بدء التحديث: ' + error);
    }
  };

  if (!status || !status.pendingUpdate) {
    return null;
  }

  // Don't allow closing if it's a mandatory update and not installed
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isInstalling && status.pendingUpdate?.mandatory) {
      // Prevent closing mandatory update modal
      return;
    }
    onOpenChange(newOpen);
  };

  const getIcon = () => {
    if (isInstalling) {
      return <RefreshCw className="h-16 w-16 animate-spin text-blue-500" />;
    }
    return <AlertTriangle className="h-16 w-16 text-orange-500" />;
  };

  const getTitle = () => {
    if (isInstalling) {
      return 'جاري تثبيت التحديث الإجباري';
    }
    return 'تحديث إجباري متاح';
  };

  const getDescription = () => {
    if (isInstalling) {
      return `جاري تثبيت التحديث v${status.pendingUpdate?.version}...`;
    }
    return `يتوفر تحديث إجباري للنظام (الإصدار ${status.pendingUpdate?.version}). يجب تثبيت هذا التحديث لمتابعة استخدام النظام.`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {getIcon()}
            <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
            <DialogDescription className="text-center">{getDescription()}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {status.pendingUpdate.releaseNotes && (
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold mb-2">ملاحظات الإصدار:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {status.pendingUpdate.releaseNotes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">حجم التحديث:</span>
            <span className="font-semibold">
              {(status.pendingUpdate.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          {isInstalling && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">التقدم:</span>
                <span className="font-semibold">{status.updateProgress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${status.updateProgress}%` }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {status.updateStatus === 'downloading' && 'جاري التنزيل...'}
                {status.updateStatus === 'installing' && 'جاري التثبيت...'}
                {status.updateStatus === 'rolling_back' && 'جاري التراجع...'}
              </p>
            </div>
          )}

          {!isInstalling && (
            <Button onClick={startUpdate} className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              تثبيت التحديث الآن
            </Button>
          )}

          {status.updateStatus === 'completed' && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">اكتمل التحديث! سيتم إعادة التحميل...</span>
            </div>
          )}

          {status.updateStatus === 'failed' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive text-center">
                {status.updateError || 'فشل التحديث. سيتم التراجع تلقائياً.'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
