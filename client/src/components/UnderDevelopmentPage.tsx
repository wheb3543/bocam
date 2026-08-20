import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Construction } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface UnderDevelopmentPageProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  currentPath: string;
  compactWorkspace?: boolean;
}

export default function UnderDevelopmentPage({
  title,
  description,
  icon: Icon,
  features,
  currentPath: _currentPath,
  compactWorkspace = false,
}: UnderDevelopmentPageProps) {
  const [, setLocation] = useLocation();

  if (compactWorkspace) {
    return (
      <DashboardLayout pageTitle={title} pageDescription={description}>
        <main className="flex h-[calc(100dvh-4.25rem)] min-h-0 flex-col gap-3 overflow-hidden py-3 sm:py-4">
          <section className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature} className="border-border/80 shadow-sm">
                <CardContent className="flex min-h-16 items-center gap-3 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-medium text-foreground">{feature}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card className="shrink-0 border-dashed">
            <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Construction className="h-4 w-4 text-orange-500" />
                <span>تجهيز مساحة عمل فريق التسويق الرقمي قيد التطوير.</span>
              </div>
              <Button size="sm" onClick={() => setLocation('/admin')} className="w-full sm:w-auto">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للوحة التحكم
              </Button>
            </CardContent>
          </Card>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle={title} pageDescription={description}>
      <main className="container py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-dashed">
            <CardHeader className="text-center pb-4 sm:pb-6 md:pb-8 px-4 sm:px-6">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="relative">
                  <Icon className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-muted-foreground" />
                  <Construction className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-orange-500 absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl mb-2">
                صفحة {title} قيد التطوير
              </CardTitle>
              <CardDescription className="text-sm sm:text-base md:text-lg">
                نعمل حالياً على تطوير صفحة {title} لتوفير تجربة أفضل لك
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 mb-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm sm:text-base">
                  الميزات القادمة:
                </h3>
                <ul className="text-right text-blue-800 dark:text-blue-400 space-y-2 text-sm">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-blue-500 flex-shrink-0">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                size="lg"
                onClick={() => setLocation('/admin')}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                العودة للوحة التحكم
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  );
}
