import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import logo from "@/assets/logo.png";
import { verifyEmail, resendOTP } from "@/lib/api";

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get email from navigation state
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    } else {
      // If no email in state, redirect to signup
      navigate('/signup');
    }
  }, [location.state, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await verifyEmail(email, code);

      // Store token and user data
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      setSuccess(true);

      // Redirect to appropriate dashboard based on role
      const role = res.data?.user?.role || '';
      let dashboardPath = '/dashboard';
      if (role === 'SUPER_ADMIN') dashboardPath = '/dashboard';
      else if (role === 'RCA_REGULATOR') dashboardPath = '/regulator-dashboard';
      else if (role === 'COOP_ADMIN') dashboardPath = '/coop-dashboard';
      else if (role === 'SECRETARY') dashboardPath = '/secretary-dashboard';
      else if (role === 'ACCOUNTANT') dashboardPath = '/coop-dashboard'; // Accountant uses coop dashboard
      else if (role === 'MEMBER') dashboardPath = '/member-dashboard';
      else if (role === 'BUYER') dashboardPath = '/buyer-dashboard';

      setTimeout(() => {
        navigate(dashboardPath);
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError(null);

    try {
      await resendOTP(email, 'REGISTRATION');
      setError(null);
      // Show success message
      alert('Verification code sent to your email');
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 justify-center mb-6">
              <img src={logo} alt="Smart Cooperative Hub" className="h-12 w-12 rounded" />
              <span className="text-2xl font-bold text-primary">Smart Cooperative Hub</span>
            </Link>
          </div>
          <div className="bg-card rounded-lg shadow-lg p-8 text-center border border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#b7eb34]" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h2>
            <p className="text-muted-foreground mb-4">Your account has been successfully verified. Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 justify-center mb-6">
            <img src={logo} alt="Smart Cooperative Hub" className="h-12 w-12 rounded" />
            <span className="text-2xl font-bold text-primary">Smart Cooperative Hub</span>
          </Link>
          <h2 className="text-2xl font-bold text-foreground">Verify Your Email</h2>
          <p className="text-muted-foreground mt-2">
            We've sent a verification code to <strong className="text-foreground">{email}</strong>
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-semibold text-foreground">
                Verification Code
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="h-11 pl-11 bg-background border-border"
                  maxLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-semibold bg-[#b7eb34] hover:bg-[#a3d72f] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">Didn't receive the code?</p>
            <Button
              onClick={handleResendOTP}
              disabled={resendLoading}
              variant="outline"
              className="w-full h-11 text-base font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            ← Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
