import { useState, useEffect } from "react";
import { getProfile, updateProfile, changePassword } from "@/lib/api";
import { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

const BuyerSettingsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getProfile();
        const user = response.data;
        setProfile(user);
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
          address: "", // Address not in user model, would need separate field
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load profile"
        });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      // Reload profile
      const response = await getProfile();
      setProfile(response.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile"
      });
    }
  };

  if (loading) {
    return (
      <section className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b7eb34] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load profile</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">Profile Settings</h2>
      <p className="text-gray-600 mb-6">Update your personal information below.</p>
      <form className="space-y-6" onSubmit={handleProfileUpdate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#22C55E] bg-gray-100 cursor-not-allowed"
              value={profile.email}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            {!profile.emailVerified && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-yellow-600">Email not verified</span>
                <button
                  type="button"
                  className="text-xs text-blue-600 underline hover:text-blue-800"
                  onClick={() => {/* trigger email verification */}}
                >
                  Send Verification Email
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#22C55E] bg-gray-100 cursor-not-allowed capitalize"
              value={profile.role}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#b7eb34] hover:bg-[#b7eb34] text-white font-semibold py-2 px-6 rounded shadow"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Change Password Section */}
      <div className="mt-10 border-t pt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Change Password</h3>
        {!showPasswordForm ? (
          <button
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
            onClick={() => setShowPasswordForm(true)}
          >
            Reset Password
          </button>
        ) : (
          <form className="space-y-4 max-w-md" onSubmit={async (e) => {
            e.preventDefault();
            if (passwords.new !== passwords.confirm) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "New passwords do not match"
              });
              return;
            }
            if (passwords.new.length < 8) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "New password must be at least 8 characters long"
              });
              return;
            }
            try {
              await changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new,
              });
              toast({
                title: "Success",
                description: "Password changed successfully"
              });
              setPasswords({ current: "", new: "", confirm: "" });
              setShowPasswordForm(false);
            } catch (error: any) {
              toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to change password"
              });
            }
          }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                value={passwords.current}
                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                value={passwords.new}
                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                value={passwords.confirm}
                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswords({ current: "", new: "", confirm: "" });
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#b7eb34] hover:bg-[#b7eb34] text-white font-semibold py-2 px-6 rounded shadow"
              >
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default BuyerSettingsPage;
