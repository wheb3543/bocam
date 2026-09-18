/**
 * Language Switcher
 * مكون لتبديل اللغة بين العربية والإنجليزية
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      className="flex items-center gap-2"
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{language === 'ar' ? 'English' : 'العربية'}</span>
    </Button>
  );
}
