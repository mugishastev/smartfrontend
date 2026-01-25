import { useState, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { getSystemSettings, updateSystemSettings } from '@/lib/admin-settings-api';
import { Server, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SystemConfigSection() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        platformName: 'Smart Cooperative Hub',
        platformLogo: '',
        defaultLanguage: 'en',
        maintenanceMode: false,
        maintenanceMessage: '',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await getSystemSettings();
            if (response.data.settings) {
                setFormData({
                    platformName: response.data.settings.platformName || 'Smart Cooperative Hub',
                    platformLogo: response.data.settings.platformLogo || '',
                    defaultLanguage: response.data.settings.defaultLanguage || 'en',
                    maintenanceMode: response.data.settings.maintenanceMode || false,
                    maintenanceMessage: response.data.settings.maintenanceMessage || '',
                });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to load system settings',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Confirmation for critical changes
        if (formData.maintenanceMode) {
            const confirmed = window.confirm(
                'Enabling maintenance mode will prevent users from accessing the platform. Continue?'
            );
            if (!confirmed) return;
        }

        try {
            setSaving(true);
            await updateSystemSettings(formData);
            toast({
                title: 'Success',
                description: 'System configuration updated successfully',
                className: 'bg-green-50 text-green-900 border-green-200',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to update system configuration',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Configuration
                </CardTitle>
                <CardDescription>
                    Manage platform-wide settings and branding
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formData.maintenanceMode && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Maintenance mode is currently enabled. Users cannot access the platform.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="platformName">Platform Name</Label>
                        <Input
                            id="platformName"
                            type="text"
                            value={formData.platformName}
                            onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="platformLogo">Platform Logo URL</Label>
                        <Input
                            id="platformLogo"
                            type="text"
                            value={formData.platformLogo}
                            onChange={(e) => setFormData({ ...formData, platformLogo: e.target.value })}
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="text-xs text-gray-500">Enter the URL of your platform logo</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="defaultLanguage">Default Language</Label>
                        <select
                            id="defaultLanguage"
                            value={formData.defaultLanguage}
                            onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b7eb34]"
                        >
                            <option value="en">English</option>
                            <option value="rw">Kinyarwanda</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>

                    <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="maintenanceMode" className="text-base font-semibold text-red-900">
                                    Maintenance Mode
                                </Label>
                                <p className="text-sm text-red-700">
                                    Temporarily disable platform access for maintenance
                                </p>
                            </div>
                            <Switch
                                id="maintenanceMode"
                                checked={formData.maintenanceMode}
                                onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                            />
                        </div>

                        {formData.maintenanceMode && (
                            <div className="space-y-2">
                                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                                <Input
                                    id="maintenanceMessage"
                                    type="text"
                                    value={formData.maintenanceMessage}
                                    onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
                                    placeholder="We'll be back soon!"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-[#b7eb34] hover:bg-[#a6d930] text-white"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
