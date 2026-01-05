import React from 'react';
import { UserPlus, Package, DollarSign } from 'lucide-react';

type Member = {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  createdAt?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit?: string;
  createdAt?: string;
};

type Props = { members: Member[]; products: Product[]; cooperativeName?: string };

export const RecentActivity: React.FC<Props> = ({ members, products, cooperativeName }) => {
  return (
    <div className="space-y-4">
      {members.slice(0, 3).map(m => (
        <div key={m.id} className="flex items-center gap-4 pb-4 border-b">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-[#b7eb34]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">New member joined</p>
            <p className="text-xs text-gray-500 dark:text-white">{m.firstName} {m.lastName} joined {cooperativeName || 'the cooperative'}</p>
          </div>
          <span className="text-xs text-gray-500 dark:text-white">{new Date(m.createdAt).toLocaleDateString()}</span>
        </div>
      ))}

      {products.slice(0, 2).map(p => (
        <div key={p.id} className="flex items-center gap-4 pb-4 border-b">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">New product added</p>
            <p className="text-xs text-gray-500 dark:text-white">{p.name} - {p.stock} {p.unit}</p>
          </div>
          <span className="text-xs text-gray-500 dark:text-white">{new Date(p.createdAt).toLocaleDateString()}</span>
        </div>
      ))}

      {members.length === 0 && products.length === 0 && (
        <div className="text-sm text-gray-500 dark:text-white">No recent activity</div>
      )}
    </div>
  );
};
