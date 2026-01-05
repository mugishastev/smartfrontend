import React from 'react';
import type { LucideIcon } from 'lucide-react';

type Props = {
  label: string;
  value: React.ReactNode;
  description?: string;
  Icon: LucideIcon;
  color?: string;
};

export const StatCard: React.FC<Props> = ({ label, value, description, Icon, color }) => {
  const colorClasses: { [key: string]: string } = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${colorClasses[color ?? 'gray']} shadow-sm`}>
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-white">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {description && <p className="text-xs text-gray-400 dark:text-white">{description}</p>}
        </div>
      </div>
    </div>
  );
};
