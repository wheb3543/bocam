/**
 * License Activation Page
 * صفحة تفعيل الترخيص
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Key, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ActivationPage() {
  const [, navigate] = useLocation();
  const [licenseKey, setLicenseKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if license already exists
  const { data: licenseCheck, isLoading: checkingLicense } =
    trpc.license.checkLicenseExists.useQuery();

  useEffect(() => {
    if (licenseCheck?.exists) {
      toast.success('الترخيص موجود بالفعل');
      navigate('/');
    }
  }, [licenseCheck, navigate]);

  const saveLicenseMutation = trpc.license.saveLicense.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success('تم تفعيل الترخيص بنجاح!');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    },
    onError: (err) => {
      toast.error(err.message || 'فشل تفعيل الترخيص');
    },
  });

  const handleActivation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!licenseKey || licenseKey.trim().length === 0) {
      toast.error('يرجى إدخال كود الترخيص');
      return;
    }

    setIsSubmitting(true);

    try {
      // Decode the license key (base64 encoded JSON)
      const licenseBuffer = Buffer.from(licenseKey, 'base64');
      const licenseObject = JSON.parse(licenseBuffer.toString('utf-8'));

      if (!licenseObject.payload || !licenseObject.signature) {
        throw new Error('كود الترخيص غير صالح');
      }

      const payload = licenseObject.payload;

      // Submit to server
      saveLicenseMutation.mutate({
        key: licenseKey,
        hardwareId: payload.hid,
        expiryDate: new Date(payload.exp * 1000).toISOString(),
        features: payload.feat,
        issuedAt: new Date(payload.iat * 1000).toISOString(),
        version: payload.ver || '1.0',
      });
    } catch (error) {
      toast.error('كود الترخيص غير صالح');
      setIsSubmitting(false);
    }
  };

  if (checkingLicense) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">تفعيل الترخيص</CardTitle>
          <CardDescription className="text-base">أدخل كود الترخيص لتفعيل النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleActivation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="licenseKey" className="text-base">
                كود الترخيص
              </Label>
              <Input
                id="licenseKey"
                type="text"
                placeholder="أدخل كود الترخيص هنا..."
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                disabled={isSubmitting}
                className="text-base min-h-[44px]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full min-h-[44px] text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري التفعيل...
                </>
              ) : (
                <>
                  <Shield className="ml-2 h-5 w-5" />
                  تفعيل الترخيص
                </>
              )}
            </Button>

            <div className="pt-4 border-t">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">
                  تأكد من أن كود الترخيص صحيح ومخصص لهذا الجهاز. كود الترخيص مرتبط بمعرف الجهاز
                  (Hardware ID).
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
