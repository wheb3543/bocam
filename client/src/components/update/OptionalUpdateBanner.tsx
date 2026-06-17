import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Info } from 'lucide-react';

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

interface OptionalUpdateBannerProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export function OptionalUpdateBanner({ onInstall, onDismiss }: OptionalUpdateBannerProps) {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    fetchUpdateStatus();
    const interval = setInterval(fetchUpdateStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUpdateStatus = async () => {
    try {
      const response = await fetch('/api/update/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);

        // Show banner if there's a non-mandatory pending update
        if (
          data.data.pendingUpdate &&
          !data.data.pendingUpdate.mandatory &&
          !data.data.updateInProgress
        ) {
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch update status:', error);
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
        if (onInstall) onInstall();
        setIsVisible(false);
      } else {
        alert('فشل بدء التحديث: ' + data.error);
        setIsInstalling(false);
      }
    } catch (error) {
      alert('فشل بدء التحديث: ' + error);
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible || !status?.pendingUpdate || status.pendingUpdate.mandatory) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                تحديث جديد متاح: الإصدار {status.pendingUpdate.version}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {status.pendingUpdate.releaseNotes?.substring(0, 100)}
                {status.pendingUpdate.releaseNotes &&
                  status.pendingUpdate.releaseNotes.length > 100 &&
                  '...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isInstalling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  جاري التثبيت...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  تثبيت
                </>
              )}
            </Button>

            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
