import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Download, RefreshCw } from 'lucide-react';

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

export function UpdateStatusBadge() {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpdateStatus();
    const interval = setInterval(fetchUpdateStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUpdateStatus = async () => {
    try {
      const response = await fetch('/api/update/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch {
      // Silently handle update status fetch errors
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-2">
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span>جاري التحقق...</span>
      </Badge>
    );
  }

  if (!status) {
    return null;
  }

  // Show progress if update is in progress
  if (status.updateInProgress) {
    return (
      <Badge variant="destructive" className="gap-2">
        <Download className="h-3 w-3 animate-bounce" />
        <span>
          {status.updateStatus === 'downloading' && 'جاري التنزيل'}
          {status.updateStatus === 'installing' && 'جاري التثبيت'}
          {status.updateStatus === 'rolling_back' && 'جاري التراجع'}
          {status.updateProgress > 0 && ` (${status.updateProgress}%)`}
        </span>
      </Badge>
    );
  }

  // Show pending update
  if (status.pendingUpdate) {
    if (status.pendingUpdate.mandatory) {
      return (
        <Badge variant="destructive" className="gap-2">
          <AlertCircle className="h-3 w-3" />
          <span>تحديث إجباري متاح</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="gap-2">
          <Download className="h-3 w-3" />
          <span>تحديث متاح: v{status.pendingUpdate.version}</span>
        </Badge>
      );
    }
  }

  // Show up to date
  return (
    <Badge variant="default" className="gap-2 bg-green-600">
      <CheckCircle className="h-3 w-3" />
      <span>محدث</span>
    </Badge>
  );
}
