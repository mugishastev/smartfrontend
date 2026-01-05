import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2,
  UserIcon,
  Lock,
  Mail,
  Loader2,
  Settings
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, FormEvent } from "react";
import { getProfile, updateProfile, logout, updateCooperative, requestPasswordReset, resetPassword } from "@/lib/api";
import type { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  const [cooperativeData, setCooperativeData] = useState({
    name: "",
    logo: null as File | null,
    description: "",
    type: "",
    location: "",
    website: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [otpData, setOtpData] = useState({
    email: "",
    code: "",
    showOtpInput: false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await getProfile();
        setProfile(res.data);
        setFormData({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          email: res.data.email,
          phone: res.data.phone || ""
        });
        if (res.data.cooperative) {
          setCooperativeData({
            name: res.data.cooperative.name || "",
            logo: null,
            description: res.data.cooperative.description || "",
            type: res.data.cooperative.type || "",
            location: res.data.cooperative.location || "",
            website: res.data.cooperative.website || "",
          });
        }
      } catch (err: any) {
        setError(err.message);
        toast({ variant: "destructive", title: "Error", description: "Failed to load profile. " + err.message });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [toast]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateProfile(formData);
      if (res.data.user) {
        setProfile(res.data.user);
      }
      toast({ title: "Success", description: "Profile updated successfully", className: "bg-green-50 text-green-900 border-green-200" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile. " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCooperativeUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateCooperative(cooperativeData);
      setProfile(prev => prev ? { ...prev, cooperative: { ...prev.cooperative, ...res.data } } : null);
      toast({ title: "Success", description: "Cooperative settings updated successfully", className: "bg-green-50 text-green-900 border-green-200" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update cooperative settings. " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordResetRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile?.email) {
      toast({ variant: "destructive", title: "Error", description: "Email address not found" });
      return;
    }
    try {
      setChangingPassword(true);
      await requestPasswordReset(profile.email);
      setOtpData(prev => ({ ...prev, email: profile.email, showOtpInput: true }));
      toast({ title: "Success", description: "Password reset code sent to your email", className: "bg-green-50 text-green-900 border-green-200" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to request password reset. " + err.message });
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match" });
      return;
    }
    try {
      setChangingPassword(true);
      await resetPassword({ email: otpData.email, code: otpData.code, newPassword: passwordData.newPassword });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setOtpData({ email: "", code: "", showOtpInput: false });
      toast({ title: "Success", description: "Password changed successfully", className: "bg-green-50 text-green-900 border-green-200" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to reset password. " + err.message });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-11 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                <div className="h-11 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-11 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500 mb-2">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">First Name</label>
                  <Input value={formData.firstName} onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="h-11" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Last Name</label>
                  <Input value={formData.lastName} onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="h-11" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} className="h-11 pl-11" type="email" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Phone Number</label>
                <Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="h-11" type="tel" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Role</label>
                <Input value={(profile?.role ?? '').replace('_', ' ')} disabled className="h-11 bg-gray-100" />
              </div>
              <Button type="submit" className="bg-[#b7eb34] hover:bg-[#b7eb34] text-white" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {profile?.role === 'COOP_ADMIN' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Cooperative Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-11 bg-gray-200 rounded w-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500 mb-2">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCooperativeUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Cooperative Name</label>
                  <Input value={cooperativeData.name} onChange={e => setCooperativeData(prev => ({ ...prev, name: e.target.value }))} className="h-11" placeholder="Enter cooperative name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Logo</label>
                  <Input type="file" accept="image/*" onChange={e => setCooperativeData(prev => ({ ...prev, logo: e.target.files ? e.target.files[0] : null }))} className="h-11" />
                  {profile?.cooperative?.logo && (
                    <img src={profile.cooperative.logo} alt="Cooperative logo" className="h-20 w-20 object-cover rounded" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Description</label>
                  <Input value={cooperativeData.description} onChange={e => setCooperativeData(prev => ({ ...prev, description: e.target.value }))} className="h-11" placeholder="Enter cooperative description" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Type</label>
                  <Input value={cooperativeData.type} onChange={e => setCooperativeData(prev => ({ ...prev, type: e.target.value }))} className="h-11" placeholder="Enter cooperative type" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Location</label>
                  <Input value={cooperativeData.location} onChange={e => setCooperativeData(prev => ({ ...prev, location: e.target.value }))} className="h-11" placeholder="Enter cooperative location" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Website</label>
                  <Input value={cooperativeData.website} onChange={e => setCooperativeData(prev => ({ ...prev, website: e.target.value }))} className="h-11" placeholder="Enter cooperative website" />
                </div>
                <Button type="submit" className="bg-[#b7eb34] hover:bg-[#b7eb34] text-white" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-11 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500 mb-2">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : !otpData.showOtpInput ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                To change your password, we'll send a verification code to your email address: {profile?.email}
              </p>
              <Button onClick={handlePasswordResetRequest} className="bg-[#b7eb34] hover:bg-[#b7eb34] text-white w-full" disabled={changingPassword}>
                {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Code
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Verification Code</label>
                <Input value={otpData.code} onChange={e => setOtpData(prev => ({ ...prev, code: e.target.value }))} placeholder="Enter the code sent to your email" className="h-11" required />
                <Button type="button" variant="link" className="text-sm text-blue-600 p-0 h-auto" onClick={() => handlePasswordResetRequest(new Event('click') as unknown as FormEvent)} disabled={changingPassword}>
                  Resend Code
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">New Password</label>
                <Input type="password" value={passwordData.newPassword} onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="Enter new password" className="h-11" required minLength={8} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Confirm New Password</label>
                <Input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Confirm new password" className="h-11" required />
              </div>
              <div className="space-y-2">
                <Button type="submit" className="bg-[#b7eb34] hover:bg-[#b7eb34] text-white w-full" disabled={changingPassword}>
                  {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reset Password
                </Button>
                <Button type="button" variant="outline" className="w-full mt-2" onClick={() => setOtpData(prev => ({ ...prev, showOtpInput: false, code: "" }))}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Role-based quick actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.role === 'SUPER_ADMIN' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link to="/approvals"><Button className="w-full bg-[#b7eb34] hover:bg-[#b7eb34] text-white">Open Approvals</Button></Link>
              <Link to="/cooperative"><Button variant="outline" className="w-full">Manage Cooperatives</Button></Link>
              <Link to="/payments"><Button variant="outline" className="w-full">View Platform Payments</Button></Link>
            </div>
          )}
          {profile?.role === 'COOP_ADMIN' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link to="/coop-members"><Button className="w-full bg-[#b7eb34] hover:bg-[#b7eb34] text-white">Manage Members</Button></Link>
              <Link to="/coop-products"><Button variant="outline" className="w-full">Manage Products</Button></Link>
              <Link to="/coop-finances"><Button variant="outline" className="w-full">View Finances</Button></Link>
            </div>
          )}
          {profile?.role === 'BUYER' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link to="/buyer-marketplace"><Button className="w-full bg-[#b7eb34] hover:bg-[#b7eb34] text-white">Browse Marketplace</Button></Link>
              <Link to="/buyer-orders"><Button variant="outline" className="w-full">My Orders</Button></Link>
              <Link to="/buyer-payments"><Button variant="outline" className="w-full">Payment History</Button></Link>
            </div>
          )}
          {profile?.role === 'MEMBER' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link to="/member-contributions"><Button className="w-full bg-[#b7eb34] hover:bg-[#b7eb34] text-white">My Contributions</Button></Link>
              <Link to="/member-products"><Button variant="outline" className="w-full">My Products</Button></Link>
              <Link to="/member-documents"><Button variant="outline" className="w-full">Documents</Button></Link>
            </div>
          )}
          {profile?.role === 'RCA_REGULATOR' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link to="/regulator-cooperatives"><Button className="w-full bg-[#b7eb34] hover:bg-[#b7eb34] text-white">Audit Cooperatives</Button></Link>
              <Link to="/regulator-reports"><Button variant="outline" className="w-full">View Reports</Button></Link>
              <Link to="/regulator-approvals"><Button variant="outline" className="w-full">Approve Requests</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;

