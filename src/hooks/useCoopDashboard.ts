import { useState, useEffect, useCallback } from 'react';
import type { CoopDashboardStats, User } from '@/lib/types';
import { getCoopDashboard, getProfile, listMembers, listProducts } from '@/lib/api';

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
  availableStock: number;
  unit?: string;
  createdAt?: string;
};

type UseCoopDashboardReturn = {
  loading: boolean;
  error: string | null;
  profile: User | null;
  stats: CoopDashboardStats | null;
  recentMembers: Member[];
  recentProducts: Product[];
  refresh: () => Promise<void>;
};

export const useCoopDashboard = (): UseCoopDashboardReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<CoopDashboardStats | null>(null);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profileRes = await getProfile();
      const profileData: User = profileRes.data;
      setProfile(profileData);

      if (!profileData.cooperativeId) {
        setStats(null);
        setRecentMembers([]);
        setRecentProducts([]);
        return;
      }

      const cooperativeId = profileData.cooperativeId;

      // Parallelize cooperative data loads
      const [statsRes, membersRes, productsRes] = await Promise.all([
        getCoopDashboard(cooperativeId),
        listMembers(cooperativeId),
        listProducts(cooperativeId)
      ]);

      setStats(statsRes.data.stats ?? null);

      // Normalize member & product arrays with types
      const members: Member[] = Array.isArray(membersRes.data?.members) ? membersRes.data.members : [];
      const products: Product[] = Array.isArray(productsRes.data?.products) ? productsRes.data.products : [];

      setRecentMembers(members.slice(0, 5));
      setRecentProducts(products.slice(0, 5));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    loading,
    error,
    profile,
    stats,
    recentMembers,
    recentProducts,
    refresh: load
  };
};
