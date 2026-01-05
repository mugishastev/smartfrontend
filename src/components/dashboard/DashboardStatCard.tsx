import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

export const DashboardStatCard = ({
  label,
  value,
  description,
  icon: Icon,
  color = "blue",
}: DashboardStatCardProps) => {
  const colorMap = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    green: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    orange: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    red: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-md hover:border-[#b7eb34]/20 cursor-pointer">
      {/* Brand color accent on hover */}
      <div className="absolute inset-0 bg-[#b7eb34]/0 group-hover:bg-[#b7eb34]/5 dark:group-hover:bg-[#b7eb34]/10 transition-all duration-200" />
      
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          {Icon && (
            <div className={`p-4 rounded-xl ${colorMap[color]} shadow-sm transition-all duration-200 group-hover:ring-1 group-hover:ring-[#b7eb34]/30`}>
              <Icon className="h-7 w-7" strokeWidth={2.5} />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-white mb-2 transition-colors duration-200 group-hover:text-[#b7eb34]">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-200 group-hover:text-[#b7eb34]">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-white">{description}</p>
        )}
      </CardContent>
      
      {/* Animated bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b7eb34]/0 group-hover:bg-[#b7eb34] transition-all duration-200 transform scale-x-0 group-hover:scale-x-100 origin-left" />
    </Card>
  );
};