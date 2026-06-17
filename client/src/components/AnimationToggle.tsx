/**
 * AnimationToggle Component - زر التحكم في الحركات موحد
 *
 * A unified animation toggle button to enable/disable animations
 */

import { useState } from 'react';
import { Pause, Play } from 'lucide-react';

interface AnimationToggleProps {
  className?: string;
  onToggle?: (enabled: boolean) => void;
}

export default function AnimationToggle({ className = '', onToggle }: AnimationToggleProps) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const toggleAnimations = () => {
    const newState = !animationsEnabled;
    setAnimationsEnabled(newState);
    onToggle?.(newState);
  };

  return (
    <button
      onClick={toggleAnimations}
      className={`fixed top-20 left-4 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-gray-200 dark:border-gray-700 ${className}`}
      aria-label={animationsEnabled ? 'إيقاف الحركات' : 'تشغيل الحركات'}
    >
      {animationsEnabled ? (
        <Pause className="w-5 h-5 text-green-600" />
      ) : (
        <Play className="w-5 h-5 text-green-600" />
      )}
    </button>
  );
}
