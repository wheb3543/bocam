import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Globe, 
  Database, 
  Bell,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Lock,
  Key,
  Clock,
  Cloud
} from "lucide-react";

interface SystemConfig {
  sslEnabled: boolean;
  sslExpiry: number | null;
  sslIssuer: string | null;
  backupEnabled: boolean;
  backupSchedule: string;
  backupRetention: number;
  cloudBackupEnabled: boolean;
  cloudProvider: string;
  notificationsEnabled: boolean;
  notificationEmail: string;
  maintenanceMode: boolean;
  debugMode: boolean;
}

export default function AdvancedSettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      // Mock data for now - in production, this would call an API endpoint
      const mockConfig: SystemConfig = {
        sslEnabled: true,
        sslExpiry: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60),
        sslIssuer: "Let's Encrypt",
        backupEnabled: true,
        backupSchedule: "0 2 * * *",
        backupRetention: 30,
        cloudBackupEnabled: true,
        cloudProvider: "AWS S3",
        notificationsEnabled: true,
        notificationEmail: "admin@example.com",
        maintenanceMode: false,
        debugMode: false,
      };
      setConfig(mockConfig);
    } catch (error) {
      console.error('Failed to fetch system config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    try {
      setIsSaving(true);
      // In production, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      alert('فشل حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ar-SA');
  };

  const getDaysUntilExpiry = (expiry: number) => {
    const now = Math.floor(Date.now() / 1000);
    const days = Math.floor((expiry - now) / (24 * 60 * 60));
    return days;
  };

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="الإعدادات المتقدمة" pageDescription="إعدادات النظام المتقدمة">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <DashboardLayout pageTitle="الإعدادات المتقدمة" pageDescription="إعدادات النظام المتقدمة">
      <div className="space-y-6">
        {/* SSL Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <div>
                <CardTitle>تكوين SSL</CardTitle>
                <CardDescription>إعدادات شهادة SSL/HTTPS</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5" />
                <div>
                  <p className="font-semibold">SSL مفعّل</p>
                  <p className="text-sm text-muted-foreground">
                    {config.sslEnabled ? 'نعم' : 'لا'}
                  </p>
                </div>
              </div>
              {config.sslEnabled ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            {config.sslEnabled && config.sslExpiry && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">المصدر:</span>
                  <span className="font-semibold">{config.sslIssuer}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                  <span className="font-semibold">{formatDate(config.sslExpiry)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">تنتهي خلال:</span>
                  <Badge variant={getDaysUntilExpiry(config.sslExpiry) < 30 ? "destructive" : "default"}>
                    {getDaysUntilExpiry(config.sslExpiry)} يوم
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Backup Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5" />
              <div>
                <CardTitle>تكوين النسخ الاحتياطي</CardTitle>
                <CardDescription>إعدادات النسخ الاحتياطي التلقائي</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5" />
                <div>
                  <p className="font-semibold">النسخ الاحتياطي التلقائي</p>
                  <p className="text-sm text-muted-foreground">
                    {config.backupEnabled ? 'مفعّل' : 'معطل'}
                  </p>
                </div>
              </div>
              <Switch
                checked={config.backupEnabled}
                onCheckedChange={(checked) => setConfig({ ...config, backupEnabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>جدولة النسخ الاحتياطي</Label>
              <Input
                value={config.backupSchedule}
                onChange={(e) => setConfig({ ...config, backupSchedule: e.target.value })}
                placeholder="0 2 * * *"
              />
              <p className="text-xs text-muted-foreground">
                Cron expression (مثال: 0 2 * * * = يومياً الساعة 2:00 ص)
              </p>
            </div>

            <div className="space-y-2">
              <Label>سياسة الاحتفاظ (أيام)</Label>
              <Input
                type="number"
                value={config.backupRetention}
                onChange={(e) => setConfig({ ...config, backupRetention: parseInt(e.target.value) })}
                min={1}
                max={365}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud className="h-5 w-5" />
                <div>
                  <p className="font-semibold">التخزين السحابي</p>
                  <p className="text-sm text-muted-foreground">
                    {config.cloudBackupEnabled ? 'مفعّل' : 'معطل'}
                  </p>
                </div>
              </div>
              <Switch
                checked={config.cloudBackupEnabled}
                onCheckedChange={(checked) => setConfig({ ...config, cloudBackupEnabled: checked })}
              />
            </div>

            {config.cloudBackupEnabled && (
              <div className="space-y-2">
                <Label>مزود الخدمة السحابية</Label>
                <Input
                  value={config.cloudProvider}
                  onChange={(e) => setConfig({ ...config, cloudProvider: e.target.value })}
                  placeholder="AWS S3"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <div>
                <CardTitle>تكوين الإشعارات</CardTitle>
                <CardDescription>إعدادات الإشعارات والتنبيهات</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5" />
                <div>
                  <p className="font-semibold">الإشعارات</p>
                  <p className="text-sm text-muted-foreground">
                    {config.notificationsEnabled ? 'مفعّل' : 'معطل'}
                  </p>
                </div>
              </div>
              <Switch
                checked={config.notificationsEnabled}
                onCheckedChange={(checked) => setConfig({ ...config, notificationsEnabled: checked })}
              />
            </div>

            {config.notificationsEnabled && (
              <div className="space-y-2">
                <Label>البريد الإلكتروني للإشعارات</Label>
                <Input
                  type="email"
                  value={config.notificationEmail}
                  onChange={(e) => setConfig({ ...config, notificationEmail: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5" />
              <div>
                <CardTitle>تكوين النظام</CardTitle>
                <CardDescription>إعدادات النظام العامة</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">وضع الصيانة</p>
                  <p className="text-sm text-muted-foreground">
                    {config.maintenanceMode ? 'مفعّل' : 'معطل'}
                  </p>
                </div>
              </div>
              <Switch
                checked={config.maintenanceMode}
                onCheckedChange={(checked) => setConfig({ ...config, maintenanceMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5" />
                <div>
                  <p className="font-semibold">وضع التصحيح</p>
                  <p className="text-sm text-muted-foreground">
                    {config.debugMode ? 'مفعّل' : 'معطل'}
                  </p>
                </div>
              </div>
              <Switch
                checked={config.debugMode}
                onCheckedChange={(checked) => setConfig({ ...config, debugMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5" />
              <div>
                <CardTitle>تكوين الأمان</CardTitle>
                <CardDescription>إعدادات أمان النظام</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5" />
                <div>
                  <p className="font-semibold">مفتاح JWT</p>
                  <p className="text-sm text-muted-foreground">
                    تم تكوينه
                  </p>
                </div>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5" />
                <div>
                  <p className="font-semibold">الترخيص</p>
                  <p className="text-sm text-muted-foreground">
                    صالح
                  </p>
                </div>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={fetchSystemConfig}>
            <RefreshCw className="h-4 w-4 mr-2" />
            إعادة تعيين
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">تحذير</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                تغيير هذه الإعدادات قد يؤثر على عمل النظام. تأكد من فهم كل إعداد قبل تغييره.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
