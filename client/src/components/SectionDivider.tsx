/**
 * SectionDivider Component - فاصل أقسام موحد
 * 
 * A unified section divider component with gradient styling
 */

interface SectionDividerProps {
  className?: string;
  color?: "gray" | "green" | "blue";
}

export default function SectionDivider({ 
  className = "", 
  color = "gray" 
}: SectionDividerProps) {
  const colorClasses = {
    gray: "from-transparent via-gray-300 dark:via-gray-700 to-transparent",
    green: "from-transparent via-green-300 dark:via-green-700 to-transparent",
    blue: "from-transparent via-blue-300 dark:via-blue-700 to-transparent",
  };

  return (
    <div className={`w-full h-px bg-gradient-to-r ${colorClasses[color]} my-0 ${className}`} />
  );
}
