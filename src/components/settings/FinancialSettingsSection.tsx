import { useState, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getFinancialConfig, updateFinancialConfig } from '@/lib/admin-settings-api';
import { DollarSign, Loader2, Save } from 'lucide-react';

export default function FinancialSettingsSection() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        platformFeePercentage: 2.5,
        minWithdrawalAmount: 5000,
        currency: 'RWF',
        payoutSchedule: 'WEEKLY',
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await getFinancialConfig();
            if (response.data.config) {
                setConfig({
                    platformFeePercentage: response.data.config.platformFeePercentage ?? 2.5,
                    minWithdrawalAmount: response.data.config.minWithdrawalAmount ?? 5000,
                    currency: response.data.config.currency ?? 'RWF',
                    payoutSchedule: response.data.config.payoutSchedule ?? 'WEEKLY',
                });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to load financial settings',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateFinancialConfig(config);
            toast({
                title: 'Success',
                description: 'Financial settings updated successfully',
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
                    <DollarSign className="h-5 w-5" />
                    Financial Settings
                </CardTitle>
                <CardDescription>
                    Manage platform fees, withdrawal limits, and payout schedules
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="platformFeePercentage">Platform Fee (%)</Label>
                            <Input
                                id="platformFeePercentage"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={config.platformFeePercentage}
                                onChange={(e) => setConfig({ ...config, platformFeePercentage: parseFloat(e.target.value) })}
                            />
                            <p className="text-xs text-gray-500">Percentage taken from each transaction</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minWithdrawalAmount">Minimum Withdrawal Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 text-sm">RWF</span>
                                <Input
                                    id="minWithdrawalAmount"
                                    type="number"
                                    min="0"
                                    className="pl-12"
                                    value={config.minWithdrawalAmount}
                                    onChange={(e) => setConfig({ ...config, minWithdrawalAmount: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="currency">Default Currency</Label>
                            <select
                                id="currency"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={config.currency}
                                onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                            >
                                <option value="RWF">RWF (Rwandan Franc)</option>
                                <option value="USD">USD (US Dollar)</option>
                                <option value="EUR">EUR (Euro)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                            <select
                                id="payoutSchedule"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={config.payoutSchedule}
                                onChange={(e) => setConfig({ ...config, payoutSchedule: e.target.value })}
                            >
                                <option value="DAILY">Daily</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="MANUAL">Manual Request Only</option>
                            </select>
                        </div>
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
