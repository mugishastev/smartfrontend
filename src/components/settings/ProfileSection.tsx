import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { updateProfile } from '@/lib/api';
import { User } from '@/lib/types';
import { Loader2, Mail, Phone, UserIcon } from 'lucide-react';

interface ProfileSectionProps {
    user: User;
    onUpdate: (user: User) => void;
}

export default function ProfileSection({ user, onUpdate }: ProfileSectionProps) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
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
                description: 'Profile updated successfully',
                className: 'bg-green-50 text-green-900 border-green-200',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to update profile',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Profile Information
                </CardTitle>
                <CardDescription>
                    Update your personal information
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                                minLength={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                                minLength={2}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="bg-gray-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500">Email cannot be changed</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+250 788 123 456"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                            id="role"
                            type="text"
                            value={user.role.replace('_', ' ')}
                            disabled
                            className="bg-gray-100 cursor-not-allowed capitalize"
                        />
                        <p className="text-xs text-gray-500">Role cannot be changed</p>
                    </div>

                    {user.cooperative && (
                        <div className="space-y-2">
                            <Label>Cooperative</Label>
                            <Input
                                type="text"
                                value={user.cooperative.name}
                                disabled
                                className="bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-[#b7eb34] hover:bg-[#a6d930] text-white"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
