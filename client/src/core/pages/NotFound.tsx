import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';
import { useLocation } from 'wouter';
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/HeroSection';

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation('/');
  };

  return (
    <PageLayout
      title="صفحة غير موجودة - 404"
      description="الصفحة التي تبحث عنها غير موجودة"
      keywords="404, صفحة غير موجودة, خطأ"
    >
      <HeroSection
        title="404"
        subtitle="صفحة غير موجودة"
        description="عذراً، الصفحة التي تبحث عنها غير موجودة. قد تم نقلها أو حذفها."
        badge={{ text: 'خطأ', icon: AlertCircle }}
        backgroundGradient="from-[#2eb34b] via-[#007242] to-[#1ca8e5]"
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button
            onClick={handleGoHome}
            className="bg-[#1ca8e5] hover:bg-[#168fca] text-white px-6 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Home className="w-4 h-4 mr-2" />
            العودة للرئيسية
          </Button>
        </div>
      </HeroSection>
    </PageLayout>
  );
}
