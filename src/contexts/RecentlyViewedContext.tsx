import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '@/lib/types';

interface RecentlyViewedContextType {
  viewedProducts: Product[];
  addViewedProduct: (product: Product) => void;
  clearViewedProducts: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export const RecentlyViewedProvider = ({ children }: { children: ReactNode }) => {
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        setViewedProducts(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recently viewed products:', error);
      }
    }
  }, []);

  // Save to localStorage when viewedProducts changes
  useEffect(() => {
    if (viewedProducts.length > 0) {
      localStorage.setItem('recentlyViewed', JSON.stringify(viewedProducts));
    }
  }, [viewedProducts]);

  const addViewedProduct = (product: Product) => {
    setViewedProducts((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);
      // Add to beginning and limit to 10
      return [product, ...filtered].slice(0, 10);
    });
  };

  const clearViewedProducts = () => {
    setViewedProducts([]);
    localStorage.removeItem('recentlyViewed');
  };

  return (
    <RecentlyViewedContext.Provider
      value={{
        viewedProducts,
        addViewedProduct,
        clearViewedProducts,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
};

