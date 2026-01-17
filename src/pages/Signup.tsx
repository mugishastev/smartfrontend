import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { register, registerCooperative } from "@/lib/api";

type Role = "buyer" | "cooperative-admin";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;

  cooperativeName: string;
  registrationNumber: string;
  cooperativeEmail: string;
  cooperativePhone: string;
  cooperativeAddress: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  cooperativeType: string;
  description: string;
  foundedDate?: string;

  rcaDocument: File | null;
  logo: File | null;
  constitution: File | null;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",

    cooperativeName: "",
    registrationNumber: "",
    cooperativeEmail: "",
    cooperativePhone: "",
    cooperativeAddress: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    cooperativeType: "",
    description: "",
    foundedDate: "",

    rcaDocument: null,
    logo: null,
    constitution: null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setForm({ ...form, rcaDocument: e.target.files[0] });
    }
  };

  const validate = (): boolean => {
    if (!role) {
      setError("Please select a role.");
      return false;
    }

    if (role === "buyer") {
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        setError("All user fields are required.");
        return false;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
    }

    if (role === "cooperative-admin") {
      const requiredFields = [
        form.cooperativeName,
        form.registrationNumber,
        form.cooperativeEmail,
        form.cooperativePhone,
        form.cooperativeAddress,
        form.district,
        form.sector,
        form.cell,
        form.village,
        form.cooperativeType,
        form.rcaDocument,
      ];

      if (requiredFields.some((v) => !v)) {
        setError("Please fill in all required cooperative fields.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      if (role === "buyer") {
        await register({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          role: "BUYER",
        });

        navigate("/verify-email", {
          state: { email: form.email },
        });
        return;
      }

      // ---- Cooperative Admin (multipart) ----
      await registerCooperative({
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
        description: form.description || "",
        foundedDate: form.foundedDate,
        certificate: form.rcaDocument as File,
        logo: form.logo || undefined,
        constitution: form.constitution || undefined,
      });

      alert(
        "Cooperative registration submitted successfully. Await admin approval."
      );
      navigate("/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-[#1A8F4B] rounded-lg px-3 py-2 mt-1 h-10 bg-background text-foreground focus:ring-2 focus:ring-[#b7eb34]";

  const textareaClass =
    "w-full border border-[#1A8F4B] rounded-lg px-3 py-2 mt-1 h-20 bg-background text-foreground resize-none";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-card border rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="mx-auto w-20 mb-3" />
          <h2 className="text-3xl font-bold text-[#b7eb34]">
            Create Account
          </h2>
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className={inputClass}
        >
          <option value="">Select role</option>
          <option value="buyer">Buyer</option>
          <option value="cooperative-admin">Cooperative Admin</option>
        </select>

        {role && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {role === "buyer" && (
              <>
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                />
              </>
            )}

            {role === "cooperative-admin" && (
              <>
                <input name="cooperativeName" placeholder="Cooperative Name" onChange={handleChange} className={inputClass} />
                <input name="registrationNumber" placeholder="Registration Number" onChange={handleChange} className={inputClass} />
                <input name="cooperativeEmail" placeholder="Email" onChange={handleChange} className={inputClass} />
                <input name="cooperativePhone" placeholder="Phone" onChange={handleChange} className={inputClass} />
                <input name="cooperativeAddress" placeholder="Address" onChange={handleChange} className={inputClass} />
                <input name="district" placeholder="District" onChange={handleChange} className={inputClass} />
                <input name="sector" placeholder="Sector" onChange={handleChange} className={inputClass} />
                <input name="cell" placeholder="Cell" onChange={handleChange} className={inputClass} />
                <input name="village" placeholder="Village" onChange={handleChange} className={inputClass} />

                <select name="cooperativeType" onChange={handleChange} className={inputClass}>
                  <option value="">Select type</option>
                  <option value="AGRICULTURAL">Agricultural</option>
                  <option value="HANDCRAFT">Handcraft</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="CONSUMERS">Consumers</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="OTHER">Other</option>
                </select>

                <textarea
                  name="description"
                  placeholder="Description"
                  onChange={handleChange}
                  className={textareaClass}
                />

                <input name="foundedDate" type="date" placeholder="Founded Date" onChange={handleChange} className={inputClass} />

                <label className="block text-sm font-medium mt-3 mb-1">Upload Certificate (Required)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm({ ...form, rcaDocument: file });
                  }}
                  className={inputClass}
                />

                <label className="block text-sm font-medium mt-3 mb-1">Upload Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm({ ...form, logo: file });
                  }}
                  className={inputClass}
                />

                <label className="block text-sm font-medium mt-3 mb-1">Upload Constitution</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm({ ...form, constitution: file });
                  }}
                  className={inputClass}
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b7eb34] text-black font-semibold py-2 rounded-lg"
            >
              {loading ? "Processing..." : "Register"}
            </button>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </form>
        )}

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[#b7eb34]">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
