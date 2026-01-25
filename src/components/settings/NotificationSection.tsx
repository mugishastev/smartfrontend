import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getProfile, updateProfile } from '@/lib/api';

export default function NotificationSection() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        emailUpdates: true,
        securityAlerts: true,
        marketingEmails: false,
        orderUpdates: true,
        browserNotifications: false,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await getProfile();
            if (response.data.notificationSettings) {
                // Merge with defaults to ensure all keys exist
                setSettings({ ...settings, ...response.data.notificationSettings });
            }
        } catch (error) {
            console.error('Failed to load notification settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateProfile({
                notificationSettings: settings
            });
            toast({
                title: 'Success',
                description: 'Notification preferences updated',
                className: 'bg-green-50 text-green-900 border-green-200',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to update preferences',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-10 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                </CardTitle>
                <CardDescription>
                    Choose how you want to be notified about activity
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Notifications
                        </h3>

                        <div className="flex items-center justify-between py-2 border-b">
                            <div className="space-y-0.5">
                                <Label htmlFor="securityAlerts" className="text-base">Security Alerts</Label>
                                <p className="text-sm text-gray-500">Get notified about new sign-ins and password changes</p>
                            </div>
                            <Switch
                                id="securityAlerts"
                                checked={settings.securityAlerts}
                                onCheckedChange={() => handleToggle('securityAlerts')}
                            />
                        </div>

                        <div className="flex items-center justify-between py-2 border-b">
                            <div className="space-y-0.5">
                                <Label htmlFor="orderUpdates" className="text-base">Order Updates</Label>
                                <p className="text-sm text-gray-500">Receive updates about your order status</p>
                            </div>
                            <Switch
                                id="orderUpdates"
                                checked={settings.orderUpdates}
                                onCheckedChange={() => handleToggle('orderUpdates')}
                            />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div className="space-y-0.5">
                                <Label htmlFor="marketingEmails" className="text-base">Marketing & Offers</Label>
                                <p className="text-sm text-gray-500">Receive emails about new features and special offers</p>
                            </div>
                            <Switch
                                id="marketingEmails"
                                checked={settings.marketingEmails}
                                onCheckedChange={() => handleToggle('marketingEmails')}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Push Notifications
                        </h3>

                        <div className="flex items-center justify-between py-2">
                            <div className="space-y-0.5">
                                <Label htmlFor="browserNotifications" className="text-base">Browser Notifications</Label>
                                <p className="text-sm text-gray-500">Show notifications on your desktop</p>
                            </div>
                            <Switch
                                id="browserNotifications"
                                checked={settings.browserNotifications}
                                onCheckedChange={() => handleToggle('browserNotifications')}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#b7eb34] hover:bg-[#a6d930] text-white"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
