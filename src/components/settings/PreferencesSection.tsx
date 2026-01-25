import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { updateProfile } from '@/lib/api';
import { User } from '@/lib/types';
import { Settings as SettingsIcon, Loader2 } from 'lucide-react';

interface PreferencesSectionProps {
    user: User;
    onUpdate: (user: User) => void;
}

export default function PreferencesSection({ user, onUpdate }: PreferencesSectionProps) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        language: user.language || 'en',
        theme: user.theme || 'light',
        timeZone: user.timeZone || 'Africa/Kigali',
        dateFormat: user.dateFormat || 'DD/MM/YYYY',
        currency: user.currency || 'RWF',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await updateProfile(formData);
            if (response.data.user) {
                onUpdate(response.data.user);
            }
            toast({
                title: 'Success',
                description: 'Preferences updated successfully',
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Preferences
                </CardTitle>
                <CardDescription>
                    Customize your experience with language, theme, and regional settings
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                            value={formData.language}
                            onValueChange={(value) => setFormData({ ...formData, language: value })}
                        >
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="rw">Kinyarwanda</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                            value={formData.theme}
                            onValueChange={(value) => setFormData({ ...formData, theme: value })}
                        >
                            <SelectTrigger id="theme">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timeZone">Time Zone</Label>
                        <Select
                            value={formData.timeZone}
                            onValueChange={(value) => setFormData({ ...formData, timeZone: value })}
                        >
                            <SelectTrigger id="timeZone">
                                <SelectValue placeholder="Select time zone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Africa/Kigali">Africa/Kigali (CAT)</SelectItem>
                                <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                                <SelectItem value="UTC">UTC</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateFormat">Date Format</Label>
                        <Select
                            value={formData.dateFormat}
                            onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}
                        >
                            <SelectTrigger id="dateFormat">
                                <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                            value={formData.currency}
                            onValueChange={(value) => setFormData({ ...formData, currency: value })}
                        >
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RWF">RWF (Rwandan Franc)</SelectItem>
                                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-[#b7eb34] hover:bg-[#a6d930] text-white"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
