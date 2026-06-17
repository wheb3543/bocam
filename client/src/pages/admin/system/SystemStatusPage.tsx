import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Server,
  Database,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Cpu,
  Globe,
  RefreshCw,
  Cpu as Processor,
} from 'lucide-react';

interface SystemStatus {
  server: {
    uptime: number;
    status: 'running' | 'stopped' | 'error';
    lastRestart: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    connections: number;
    size: number;
  };
  ssl: {
    enabled: boolean;
    valid: boolean;
    expiresAt: number | null;
    issuer: string | null;
  };
  heartbeat: {
    status: 'active' | 'inactive' | 'error';
    lastBeat: number;
    nextBeat: number;
  };
  updateChecker: {
    status: 'active' | 'inactive' | 'error';
    lastCheck: number;
    nextCheck: number;
  };
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export default function SystemStatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      // For now, use mock data. In production, this would call an API endpoint
      const mockStatus: SystemStatus = {
        server: {
          uptime: Math.floor(Date.now() / 1000) - 1717334400, // Mock uptime
          status: 'running',
          lastRestart: 1717334400,
        },
        database: {
          status: 'connected',
          connections: 5,
          size: 256, // MB
        },
        ssl: {
          enabled: true,
          valid: true,
          expiresAt: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // 90 days from now
          issuer: "Let's Encrypt",
        },
        heartbeat: {
          status: 'active',
          lastBeat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          nextBeat: Math.floor(Date.now() / 1000) + 23 * 60 * 60, // 23 hours from now
        },
        updateChecker: {
          status: 'active',
          lastCheck: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
          nextCheck: Math.floor(Date.now() / 1000) + 5 * 60 * 60, // 5 hours from now
        },
        resources: {
          cpu: 45,
          memory: 62,
          disk: 38,
        },
      };

      setStatus(mockStatus);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'connected':
      case 'active':
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'stopped':
      case 'disconnected':
      case 'inactive':
      case 'invalid':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
      case 'connected':
      case 'active':
      case 'valid':
        return <Badge className="bg-green-600">نشط</Badge>;
      case 'stopped':
      case 'disconnected':
      case 'inactive':
      case 'invalid':
        return <Badge variant="destructive">غير نشط</Badge>;
      case 'error':
        return <Badge variant="destructive">خطأ</Badge>;
      default:
        return <Badge variant="secondary">غير معروف</Badge>;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    if (days > 0) {
      return `${days} يوم، ${hours} ساعة`;
    }
    if (hours > 0) {
      return `${hours} ساعة، ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ar-SA');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="حالة النظام" pageDescription="مراقبة حالة النظام">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="حالة النظام" pageDescription="مراقبة حالة النظام">
      <div className="space-y-6">
        {/* Server Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5" />
                <CardTitle>حالة السيرفر</CardTitle>
              </div>
              {getStatusBadge(status?.server.status || 'unknown')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">وقت التشغيل</p>
                <p className="font-semibold">
                  {status?.server.uptime ? formatUptime(status.server.uptime) : 'غير معروف'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">آخر إعادة تشغيل</p>
                <p className="font-semibold">
                  {status?.server.lastRestart ? formatDate(status.server.lastRestart) : 'غير معروف'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5" />
                <CardTitle>قاعدة البيانات</CardTitle>
              </div>
              {getStatusBadge(status?.database.status || 'unknown')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الاتصالات النشطة</p>
                <p className="font-semibold">{status?.database.connections || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">حجم قاعدة البيانات</p>
                <p className="font-semibold">
                  {status?.database.size
                    ? formatBytes(status.database.size * 1024 * 1024)
                    : 'غير معروف'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SSL Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5" />
                <CardTitle>شهادة SSL</CardTitle>
              </div>
              {status?.ssl.enabled ? (
                getStatusBadge(status?.ssl.valid ? 'valid' : 'invalid')
              ) : (
                <Badge variant="secondary">غير مفعّل</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.ssl.enabled ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">المصدر</p>
                    <p className="font-semibold">{status.ssl.issuer || 'غير معروف'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                    <p className="font-semibold">
                      {status.ssl.expiresAt ? formatDate(status.ssl.expiresAt) : 'غير معروف'}
                    </p>
                  </div>
                </div>
                {status.ssl.expiresAt && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">
                      تنتهي خلال{' '}
                      {Math.floor(
                        (status.ssl.expiresAt - Math.floor(Date.now() / 1000)) / (24 * 60 * 60)
                      )}{' '}
                      يوم
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">SSL غير مفعّل</p>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Heartbeat Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5" />
                <CardTitle>نظام Heartbeat</CardTitle>
              </div>
              {getStatusBadge(status?.heartbeat.status || 'unknown')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">آخر نبضة</p>
                <p className="font-semibold">
                  {status?.heartbeat.lastBeat ? formatDate(status.heartbeat.lastBeat) : 'غير معروف'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">النبضة القادمة</p>
                <p className="font-semibold">
                  {status?.heartbeat.nextBeat ? formatDate(status.heartbeat.nextBeat) : 'غير معروف'}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              يرسل النظام نبضة كل 24 ساعة إلى السيرفر المركزي للمراقبة عن بعد
            </p>
          </CardContent>
        </Card>

        {/* Update Checker Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5" />
                <CardTitle>نظام Update Checker</CardTitle>
              </div>
              {getStatusBadge(status?.updateChecker.status || 'unknown')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">آخر فحص</p>
                <p className="font-semibold">
                  {status?.updateChecker.lastCheck
                    ? formatDate(status.updateChecker.lastCheck)
                    : 'غير معروف'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الفحص القادم</p>
                <p className="font-semibold">
                  {status?.updateChecker.nextCheck
                    ? formatDate(status.updateChecker.nextCheck)
                    : 'غير معروف'}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">يتحقق النظام من التحديثات كل 6 ساعات</p>
          </CardContent>
        </Card>

        <Separator />

        {/* System Resources */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5" />
              <CardTitle>موارد النظام</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span className="text-sm">CPU</span>
                </div>
                <span className="text-sm font-semibold">{status?.resources.cpu || 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${status?.resources.cpu || 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Processor className="h-4 w-4" />
                  <span className="text-sm">الذاكرة</span>
                </div>
                <span className="text-sm font-semibold">{status?.resources.memory || 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${status?.resources.memory || 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm">القرص</span>
                </div>
                <span className="text-sm font-semibold">{status?.resources.disk || 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${status?.resources.disk || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={fetchSystemStatus} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث الحالة
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
