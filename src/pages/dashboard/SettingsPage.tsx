import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SettingsLayout from '@/components/settings/SettingsLayout';
import ProfileSection from '@/components/settings/ProfileSection';
import SecuritySection from '@/components/settings/SecuritySection';
import PreferencesSection from '@/components/settings/PreferencesSection';
import AccountSection from '@/components/settings/AccountSection';
import NotificationSection from '@/components/settings/NotificationSection';
import SystemConfigSection from '@/components/settings/SystemConfigSection';
import ActivityAuditSection from '@/components/settings/ActivityAuditSection';
import { getProfile } from '@/lib/api';
import { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#b7eb34]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <SettingsLayout user={user}>
      <Routes>
        <Route path="/" element={<Navigate to="/settings/profile" replace />} />
        <Route
          path="/profile"
          element={<ProfileSection user={user} onUpdate={handleUserUpdate} />}
        />
        <Route path="/account" element={<AccountSection />} />
        <Route path="/security" element={<SecuritySection />} />
        <Route path="/notifications" element={<NotificationSection />} />
        <Route
          path="/preferences"
          element={<PreferencesSection user={user} onUpdate={handleUserUpdate} />}
        />

        {/* Super Admin Only Routes */}
        {user.role === 'SUPER_ADMIN' && (
          <>
            <Route
              path="/users"
              element={<div className="p-6">User & Role Management (Coming Soon)</div>}
            />
            <Route
              path="/cooperative"
              element={<div className="p-6">Cooperative Settings (Coming Soon)</div>}
            />
            <Route
              path="/financial"
              element={<div className="p-6">Financial Settings (Coming Soon)</div>}
            />
            <Route path="/system" element={<SystemConfigSection />} />
            <Route path="/audit" element={<ActivityAuditSection />} />
          </>
        )}
      </Routes>
    </SettingsLayout>
  );
}
