import { request } from './api';
import type { ApiResponse } from './types';

/* Admin Settings (Super Admin) */
export async function getSystemSettings(): Promise<ApiResponse<{ settings: any }>> {
    return request('/admin/settings/system');
}

export async function updateSystemSettings(data: any): Promise<ApiResponse<{ message: string; settings: any }>> {
    return request('/admin/settings/system', { method: 'PUT', body: JSON.stringify(data) });
}

export async function getCooperativeConfig(): Promise<ApiResponse<{ config: any }>> {
    return request('/admin/settings/cooperative');
}

export async function updateCooperativeConfig(data: any): Promise<ApiResponse<{ message: string; config: any }>> {
    return request('/admin/settings/cooperative', { method: 'PUT', body: JSON.stringify(data) });
}

export async function getFinancialConfig(): Promise<ApiResponse<{ config: any }>> {
    return request('/admin/settings/financial');
}

export async function updateFinancialConfig(data: any): Promise<ApiResponse<{ message: string; config: any }>> {
    return request('/admin/settings/financial', { method: 'PUT', body: JSON.stringify(data) });
}

export async function getActivityLogs(filters?: { userId?: string; action?: string; limit?: number; offset?: number }): Promise<ApiResponse<{ logs: any[]; total: number }>> {
    const qp = new URLSearchParams();
    if (filters?.userId) qp.append('userId', filters.userId);
    if (filters?.action) qp.append('action', filters.action);
    if (filters?.limit) qp.append('limit', String(filters.limit));
    if (filters?.offset) qp.append('offset', String(filters.offset));
    const q = qp.toString() ? `?${qp.toString()}` : '';
    return request(`/admin/settings/activity-logs${q}`);
}

/* User Management Exports (Re-exporting or defining if unique to settings context) */
export async function listAllUsers(search?: string, role?: string, page: number = 1): Promise<ApiResponse<any>> {
    const qp = new URLSearchParams();
    if (search) qp.append('search', search);
    if (role && role !== 'ALL') qp.append('role', role);
    qp.append('page', String(page));
    qp.append('limit', '20');
    return request(`/admin/users?${qp.toString()}`);
}

export async function updateUserStatus(userId: string, action: 'activate' | 'deactivate' | 'delete'): Promise<ApiResponse<void>> {
    return request(`/users/${encodeURIComponent(userId)}/${action}`, { method: 'POST' });
}
