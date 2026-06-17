import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, Download, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

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

interface UpdateProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateProgressModal({ open, onOpenChange }: UpdateProgressModalProps) {
  const [status, setStatus] = useState<UpdateStatus | null>(null);

  useEffect(() => {
    if (open) {
      fetchUpdateStatus();
      const interval = setInterval(fetchUpdateStatus, 2000); // Check every 2 seconds when modal is open
      return () => clearInterval(interval);
    }
  }, [open]);

  const fetchUpdateStatus = async () => {
    try {
      const response = await fetch('/api/update/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);

        // Close modal if update is completed
        if (data.data.updateStatus === 'completed') {
          setTimeout(() => {
            onOpenChange(false);
            window.location.reload(); // Reload to apply update
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to fetch update status:', error);
    }
  };

  if (!status) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status.updateStatus) {
      case 'downloading':
        return <Download className="h-8 w-8 animate-bounce text-blue-500" />;
      case 'installing':
        return <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'rolling_back':
        return <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />;
      default:
        return <Download className="h-8 w-8 text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (status.updateStatus) {
      case 'downloading':
        return 'جاري تنزيل التحديث...';
      case 'installing':
        return 'جاري تثبيت التحديث...';
      case 'completed':
        return 'اكتمل التحديث بنجاح!';
      case 'failed':
        return 'فشل التحديث';
      case 'rolling_back':
        return 'جاري التراجع عن التحديث...';
      default:
        return 'جاري التحديث...';
    }
  };

  const getStatusDescription = () => {
    switch (status.updateStatus) {
      case 'downloading':
        return `جاري تنزيل التحديث v${status.pendingUpdate?.version} (${(status.pendingUpdate?.size || 0 / 1024 / 1024).toFixed(2)} MB)`;
      case 'installing':
        return 'جاري تثبيت الملفات وإعادة تشغيل النظام...';
      case 'completed':
        return 'سيتم إعادة تشغيل النظام تلقائياً لتطبيق التحديث.';
      case 'failed':
        return status.updateError || 'حدث خطأ أثناء التحديث. سيتم التراجع تلقائياً.';
      case 'rolling_back':
        return 'جاري استعادة النسخة السابقة...';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {getStatusIcon()}
            <DialogTitle className="text-xl">{getStatusText()}</DialogTitle>
            <DialogDescription className="text-center">{getStatusDescription()}</DialogDescription>
          </div>
        </DialogHeader>

        {status.updateStatus !== 'completed' && status.updateStatus !== 'failed' && (
          <div className="space-y-4">
            <Progress value={status.updateProgress} className="h-2" />
            <div className="text-center text-sm text-muted-foreground">
              {status.updateProgress}%
            </div>
          </div>
        )}

        {status.updateStatus === 'failed' && status.updateError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">{status.updateError}</div>
            </div>
          </div>
        )}

        {status.updateStatus === 'completed' && (
          <Button onClick={() => window.location.reload()} className="w-full">
            إعادة التحميل الآن
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
