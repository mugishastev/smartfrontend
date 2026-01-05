import { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  loading?: boolean;
}

export const DashboardHeader = ({
  title,
  subtitle,
  actions,
  loading = false,
}: DashboardHeaderProps) => {
  if (loading) {
    return (
      <div className="mb-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">{actions}</div>}
    </div>
  );
};