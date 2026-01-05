import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { register, registerCooperative } from "@/lib/api";

type Role = "buyer" | "cooperative-admin";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    const [form, setForm] = useState<any>({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      cooperativeName: "",
      cooperativeEmail: "",
      cooperativePhone: "",
      cooperativeAddress: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      cooperativeType: "",
      description: "",
      registrationNumber: "",
      rcaDocument: null,
    });

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setForm({ ...form, rcaDocument: e.target.files[0] });
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!role) {
        setError("Please select a role before registering.");
        return;
      }

      // For cooperative admin, only validate cooperative fields
      if (role === 'cooperative-admin') {
        if (!form.cooperativeName || !form.registrationNumber || !form.cooperativeEmail ||
          !form.cooperativePhone || !form.cooperativeAddress || !form.district ||
          !form.sector || !form.cell || !form.village || !form.cooperativeType) {
          setError("Please fill in all required cooperative information.");
          return;
        }
      } else {
        // For other roles, validate user fields
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        if (role === 'cooperative-admin') {
          // Register cooperative only (no user account yet)
          const coopPayload: any = {
            name: form.cooperativeName,
            registrationNumber: form.registrationNumber,
            email: form.cooperativeEmail,
            phone: form.cooperativePhone,
            address: form.cooperativeAddress,
            district: form.district,
            sector: form.sector,
            cell: form.cell,
            village: form.village,
            type: form.cooperativeType,
            description: form.description,
          };
          if (form.rcaDocument) coopPayload.certificate = form.rcaDocument;
          if (form.logo) coopPayload.logo = form.logo;
          if (form.constitution) coopPayload.constitution = form.constitution;

          await registerCooperative(coopPayload);

          // Show success message and redirect to login
          alert('Cooperative registration submitted successfully! Your application is pending approval from the super admin. You will receive an email with login credentials once approved.');
          navigate('/login');
          return;
        } else {
          // Register user normally (Buyer)
          const userData = {
            email: form.email,
            const userData = {
              email: form.email,
              password: form.password,
              firstName: form.firstName,
              lastName: form.lastName,
              role: 'BUYER' as const,
            };

            await register(userData);

            // Success: navigate to email verification page
            navigate('/verify-email', { state: { email: form.email
          }
        });
}
    } catch (err: any) {
  setError(err?.message || 'Registration failed');
} finally {
  setLoading(false);
}
};

const inputClass =
  "w-full border border-[#1A8F4B] rounded-lg px-3 py-2 mt-1 h-10 bg-background text-foreground focus:ring-2 focus:ring-[#b7eb34] focus:border-[#b7eb34] placeholder:text-muted-foreground";
const textareaClass =
  "w-full border border-[#1A8F4B] rounded-lg px-3 py-2 mt-1 h-20 bg-background text-foreground focus:ring-2 focus:ring-[#b7eb34] focus:border-[#b7eb34] resize-none placeholder:text-muted-foreground";

return (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-8">
      <div className="text-center mb-6">
        <img src={logo} alt="Logo" className="mx-auto w-20 mb-3" />
        <h2
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b7eb34] to-[#b7eb34]"
        >
          Create Account
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select your role to start registration
        </p>
      </div>

      {/* Role Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className={inputClass}
          required
        >
          <option value="">Select your role</option>
          <option value="buyer">Buyer</option>
          <option value="cooperative-admin">Cooperative Admin</option>
        </select>
      </div>

      {/* Show form only after selecting a role */}
      {role && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name - Hide for cooperative admin */}
          {role !== 'cooperative-admin' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          )}

          {/* Email - Hide for cooperative admin */}
          {role !== 'cooperative-admin' && (
            <div>
              <label className="block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          )}

          {/* Passwords - Hide for cooperative admin */}
          {role !== 'cooperative-admin' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          )}

          {/* Cooperative Admin Section */}
          {role === "cooperative-admin" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground">Cooperative Name</label>
                <input
                  type="text"
                  name="cooperativeName"
                  value={form.cooperativeName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  name="cooperativeEmail"
                  value={form.cooperativeEmail}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Phone</label>
                <input
                  type="text"
                  name="cooperativePhone"
                  value={form.cooperativePhone}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Address</label>
                <input
                  type="text"
                  name="cooperativeAddress"
                  value={form.cooperativeAddress}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              {/* Location fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground">District</label>
                  <input
                    type="text"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">Sector</label>
                  <input
                    type="text"
                    name="sector"
                    value={form.sector}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground">Cell</label>
                  <input
                    type="text"
                    name="cell"
                    value={form.cell}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">Village</label>
                  <input
                    type="text"
                    name="village"
                    value={form.village}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Type</label>
                <select
                  name="cooperativeType"
                  value={form.cooperativeType}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select cooperative type</option>
                  <option value="AGRICULTURAL">Agricultural</option>
                  <option value="HANDCRAFT">Handcraft</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="CONSUMERS">Consumers</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={textareaClass}
                  placeholder="Brief description of your cooperative..."
                />
              </div>

              {/* RCA Document Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Upload RCA Certificate (PDF, DOC, DOCX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className={inputClass}
                  required
                />
              </div>
            </>
          )}


          <button
            type="submit"
            className="w-full text-white font-semibold py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#b7eb34" }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
          {error && (
            <div className="mt-2 text-sm text-destructive text-center">{error}</div>
          )}
        </form>
      )}

      <div className="text-center mt-3">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-[#b7eb34] font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  </div>
);
};

export default RegisterPage;