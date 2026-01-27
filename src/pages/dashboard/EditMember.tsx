import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserCog, ArrowLeft, Save } from "lucide-react";
import { getMemberById, updateMember } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const EditMember = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        role: "MEMBER",
        isActive: true,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchMember = async () => {
            if (!id) return;
            try {
                setFetching(true);
                const response = await getMemberById(id);
                const member = (response.data as any)?.member || response.data;

                if (member) {
                    setFormData({
                        firstName: member.firstName || "",
                        lastName: member.lastName || "",
                        phone: member.phone || "",
                        role: member.role || "MEMBER",
                        isActive: member.isActive ?? true,
                    });
                }
            } catch (error: any) {
                console.error('Fetch member error:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load member details."
                });
                navigate("/coop-members");
            } finally {
                setFetching(false);
            }
        };

        fetchMember();
    }, [id, navigate, toast]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !validateForm()) return;

        setLoading(true);
        try {
            await updateMember(id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                role: formData.role as 'MEMBER' | 'SECRETARY' | 'ACCOUNTANT',
                isActive: formData.isActive,
            });

            toast({
                title: "Member Updated",
                description: `${formData.firstName} ${formData.lastName} has been updated successfully!`,
                className: "bg-green-50 text-green-900 border-green-200"
            });

            navigate("/coop-members");
        } catch (error: any) {
            console.error('Update member error:', error);
            const errorMessage = error?.message || 'Failed to update member. Please try again.';
            setErrors({ submit: errorMessage });
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b7eb34]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Button
                variant="ghost"
                onClick={() => navigate("/coop-members")}
                className="mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Members
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <UserCog className="h-6 w-6 text-[#b7eb34]" />
                        </div>
                        <div>
                            <CardTitle>Edit Member</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                Update member details and permissions
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleChange("firstName", e.target.value)}
                                    className={errors.firstName ? "border-red-600" : ""}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-600">{errors.firstName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleChange("lastName", e.target.value)}
                                    className={errors.lastName ? "border-red-600" : ""}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-600">{errors.lastName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    className={errors.phone ? "border-red-600" : ""}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Member Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => handleChange("role", value)}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MEMBER">Regular Member</SelectItem>
                                        <SelectItem value="SECRETARY">Secretary</SelectItem>
                                        <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                                        <SelectItem value="COOP_ADMIN">Coop Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Account Status</Label>
                                <Select
                                    value={formData.isActive ? "active" : "inactive"}
                                    onValueChange={(value) => handleChange("isActive", value === "active")}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive / Frozen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                {errors.submit}
                            </div>
                        )}

                        <div className="flex gap-3 justify-end pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/coop-members")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#b7eb34] hover:bg-[#8ccc15] text-white"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditMember;
