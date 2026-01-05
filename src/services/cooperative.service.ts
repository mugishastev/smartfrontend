// Lightweight wrapper for API calls — centralize typing and error handling
import { getCoopDashboard, getProfile, listMembers, listProducts } from '@/lib/api';

export const cooperativeService = {
  getProfile,
  getCoopDashboard,
  listMembers,
  listProducts
};
