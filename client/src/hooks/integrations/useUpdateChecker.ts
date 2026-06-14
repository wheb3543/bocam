import { useEffect, useState, useCallback } from "react";

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

export function useUpdateChecker() {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdateStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/update/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      } else {
        setError(data.error || 'Failed to fetch update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch update status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const installUpdate = useCallback(async () => {
    try {
      const response = await fetch('/api/update/install', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchUpdateStatus();
        return true;
      } else {
        throw new Error(data.error || 'Failed to install update');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchUpdateStatus]);

  const rollbackUpdate = useCallback(async () => {
    try {
      const response = await fetch('/api/update/rollback', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchUpdateStatus();
        return true;
      } else {
        throw new Error(data.error || 'Failed to rollback update');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchUpdateStatus]);

  useEffect(() => {
    fetchUpdateStatus();
    const interval = setInterval(fetchUpdateStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [fetchUpdateStatus]);

  return {
    status,
    isLoading,
    error,
    fetchUpdateStatus,
    installUpdate,
    rollbackUpdate,
    hasPendingUpdate: !!status?.pendingUpdate,
    isMandatoryUpdate: status?.pendingUpdate?.mandatory || false,
    isUpdateInProgress: status?.updateInProgress || false,
  };
}
