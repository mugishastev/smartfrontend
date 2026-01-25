import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { changePassword } from '@/lib/api';
import { Lock, Loader2 } from 'lucide-react';

export default function SecuritySection() {
    const { toast } = useToast();
    const [changing, setChanging] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'New passwords do not match',
            });
            return;
        }

        if (formData.newPassword.length < 8) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Password must be at least 8 characters long',
            });
            return;
        }

        try {
            setChanging(true);
            await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            toast({
                title: 'Success',
                description: 'Password changed successfully',
                className: 'bg-green-50 text-green-900 border-green-200',
            });

            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowForm(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to change password',
            });
        } finally {
            setChanging(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                </CardTitle>
                <CardDescription>
                    Manage your password and security preferences
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!showForm ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">Password</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Keep your account secure by using a strong password
                            </p>
                            <Button
                                onClick={() => setShowForm(true)}
                                variant="outline"
                            >
                                Change Password
                            </Button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Add an extra layer of security to your account
                            </p>
                            <Button variant="outline" disabled>
                                Enable 2FA (Coming Soon)
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                required
                                placeholder="Enter your current password"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                required
                                minLength={8}
                                placeholder="Enter new password (min. 8 characters)"
                            />
                            <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                minLength={8}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={changing}
                                className="bg-[#b7eb34] hover:bg-[#a6d930] text-white"
                            >
                                {changing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {changing ? 'Changing...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
