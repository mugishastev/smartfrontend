import React from 'react';
import { Package, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type Product = {
  id: string;
  name: string;
  price: number;
  availableStock: number;
  unit?: string;
  createdAt?: string;
};

type Props = { products: Product[] };

export const ProductList: React.FC<Props> = ({ products }) => {
  const navigate = useNavigate();
  if (!products.length) return (
    <div className="text-center py-8 text-gray-500 dark:text-white">
      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-white" />
      <p>No products yet</p>
      <Button onClick={() => navigate('/coop-products/add')} className="mt-4 bg-blue-600 text-white">Add Your First Product</Button>
    </div>
  );

  return (
    <div className="space-y-3">
      {products.map(product => (
        <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-[#b7eb34]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
              <p className="text-sm text-gray-600 dark:text-white">{formatCurrency(product.price)} • {product.availableStock} {product.unit}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/product/${product.id}`)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
