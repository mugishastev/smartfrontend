import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Smartphone, Mail, Trash2 } from 'lucide-react';

export default function AccountSection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Settings
                </CardTitle>
                <CardDescription>
                    Manage your account access and verification methods
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contact Info</h3>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-md shadow-sm">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Email Address</p>
                                    <p className="text-sm text-gray-500">Used for login and notifications</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Manage</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-md shadow-sm">
                                    <Smartphone className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Phone Number</p>
                                    <p className="text-sm text-gray-500">Used for recovery and alerts</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Manage</Button>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-sm font-medium text-red-600 uppercase tracking-wider mb-4">Danger Zone</h3>

                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-medium text-red-900">Delete Account</h4>
                                    <p className="text-sm text-red-700">
                                        Permanently remove your account and all associated data. This action cannot be undone.
                                    </p>
                                </div>
                                <Button variant="destructive" className="flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
