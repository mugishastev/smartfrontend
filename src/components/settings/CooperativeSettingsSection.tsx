import { useState, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { getCooperativeConfig, updateCooperativeConfig } from '@/lib/admin-settings-api';
import { Building2, Loader2, Save } from 'lucide-react';

export default function CooperativeSettingsSection() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        registrationEnabled: true,
        requireDocumentVerification: true,
        maxMembersPerCooperative: 1000,
        allowGuestAccess: false,
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await getCooperativeConfig();
            if (response.data.config) {
                setConfig({
                    registrationEnabled: response.data.config.registrationEnabled ?? true,
                    requireDocumentVerification: response.data.config.requireDocumentVerification ?? true,
                    maxMembersPerCooperative: response.data.config.maxMembersPerCooperative ?? 1000,
                    allowGuestAccess: response.data.config.allowGuestAccess ?? false,
                });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to load cooperative settings',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateCooperativeConfig(config);
            toast({
                title: 'Success',
                description: 'Cooperative settings updated successfully',
                className: 'bg-green-50 text-green-900 border-green-200',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to update settings',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Cooperative Settings
                </CardTitle>
                <CardDescription>
                    Configure rules and limits for cooperatives on the platform
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-0.5">
                            <Label htmlFor="registrationEnabled" className="text-base">Allow New Registrations</Label>
                            <p className="text-sm text-gray-500">Enable or disable new cooperative sign-ups</p>
                        </div>
                        <Switch
                            id="registrationEnabled"
                            checked={config.registrationEnabled}
                            onCheckedChange={(checked) => setConfig({ ...config, registrationEnabled: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-0.5">
                            <Label htmlFor="requireDocumentVerification" className="text-base">Require Verification</Label>
                            <p className="text-sm text-gray-500">Force manual document verification before activation</p>
                        </div>
                        <Switch
                            id="requireDocumentVerification"
                            checked={config.requireDocumentVerification}
                            onCheckedChange={(checked) => setConfig({ ...config, requireDocumentVerification: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-0.5">
                            <Label htmlFor="allowGuestAccess" className="text-base">Guest Access</Label>
                            <p className="text-sm text-gray-500">Allow non-members to view cooperative profiles</p>
                        </div>
                        <Switch
                            id="allowGuestAccess"
                            checked={config.allowGuestAccess}
                            onCheckedChange={(checked) => setConfig({ ...config, allowGuestAccess: checked })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxMembersPerCooperative">Maximum Members per Cooperative</Label>
                        <Input
                            id="maxMembersPerCooperative"
                            type="number"
                            min="1"
                            value={config.maxMembersPerCooperative}
                            onChange={(e) => setConfig({ ...config, maxMembersPerCooperative: parseInt(e.target.value) })}
                        />
                        <p className="text-xs text-gray-500">Set a hard limit on cooperative size</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-[#b7eb34] hover:bg-[#a6d930] text-white"
                        >
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
