import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@/lib/types';
import {
    UserIcon,
    Shield,
    Bell,
    Settings as SettingsIcon,
    Lock,
    Users,
    Building2,
    DollarSign,
    Server,
    Activity,
} from 'lucide-react';

interface SettingsLayoutProps {
    children: ReactNode;
    user: User;
}

interface SettingsSection {
    id: string;
    label: string;
    icon: ReactNode;
    path: string;
    roles: string[];
}

const settingsSections: SettingsSection[] = [
    // Personal Settings (All Users)
    {
        id: 'profile',
        label: 'Profile',
        icon: <UserIcon className="h-4 w-4" />,
        path: '/settings/profile',
        roles: ['SUPER_ADMIN', 'RCA_REGULATOR', 'COOP_ADMIN', 'SECRETARY', 'ACCOUNTANT', 'MEMBER', 'BUYER'],
    },
    {
        id: 'account',
        label: 'Account',
        icon: <Shield className="h-4 w-4" />,
        path: '/settings/account',
        roles: ['SUPER_ADMIN', 'RCA_REGULATOR', 'COOP_ADMIN', 'SECRETARY', 'ACCOUNTANT', 'MEMBER', 'BUYER'],
    },
    {
        id: 'security',
        label: 'Security',
        icon: <Lock className="h-4 w-4" />,
        path: '/settings/security',
        roles: ['SUPER_ADMIN', 'RCA_REGULATOR', 'COOP_ADMIN', 'SECRETARY', 'ACCOUNTANT', 'MEMBER', 'BUYER'],
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: <Bell className="h-4 w-4" />,
        path: '/settings/notifications',
        roles: ['SUPER_ADMIN', 'RCA_REGULATOR', 'COOP_ADMIN', 'SECRETARY', 'ACCOUNTANT', 'MEMBER', 'BUYER'],
    },
    {
        id: 'preferences',
        label: 'Preferences',
        icon: <SettingsIcon className="h-4 w-4" />,
        path: '/settings/preferences',
        roles: ['SUPER_ADMIN', 'RCA_REGULATOR', 'COOP_ADMIN', 'SECRETARY', 'ACCOUNTANT', 'MEMBER', 'BUYER'],
    },
    // Super Admin Only
    {
        id: 'users',
        label: 'User & Role Management',
        icon: <Users className="h-4 w-4" />,
        path: '/settings/users',
        roles: ['SUPER_ADMIN'],
    },
    {
        id: 'cooperative',
        label: 'Cooperative Settings',
        icon: <Building2 className="h-4 w-4" />,
        path: '/settings/cooperative',
        roles: ['SUPER_ADMIN'],
    },
    {
        id: 'financial',
        label: 'Financial Settings',
        icon: <DollarSign className="h-4 w-4" />,
        path: '/settings/financial',
        roles: ['SUPER_ADMIN'],
    },
    {
        id: 'system',
        label: 'System Configuration',
        icon: <Server className="h-4 w-4" />,
        path: '/settings/system',
        roles: ['SUPER_ADMIN'],
    },
    {
        id: 'audit',
        label: 'Audit & Activity Logs',
        icon: <Activity className="h-4 w-4" />,
        path: '/settings/audit',
        roles: ['SUPER_ADMIN'],
    },
];

export default function SettingsLayout({ children, user }: SettingsLayoutProps) {
    const location = useLocation();

    const availableSections = settingsSections.filter((section) =>
        section.roles.includes(user.role)
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1 bg-white rounded-lg shadow p-4">
                            {availableSections.map((section) => {
                                const isActive = location.pathname === section.path;
                                return (
                                    <Link
                                        key={section.id}
                                        to={section.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-[#b7eb34] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {section.icon}
                                        {section.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
