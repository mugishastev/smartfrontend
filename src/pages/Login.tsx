import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Call backend login endpoint
    (async () => {
      try {
        const { login } = await import('@/lib/api');
        const res = await login({ email, password });

        // Persist token and user
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        // Decide where to navigate based on role
        const role = res.data.user?.role || '';
        let dashboardPath = '/dashboard';
        if (role === 'SUPER_ADMIN') dashboardPath = '/dashboard';
        else if (role === 'RCA_REGULATOR') dashboardPath = '/regulator-dashboard';
        else if (role === 'COOP_ADMIN') dashboardPath = '/coop-dashboard';
        else if (role === 'SECRETARY') dashboardPath = '/secretary-dashboard';
        else if (role === 'ACCOUNTANT') dashboardPath = '/coop-dashboard'; // Accountant uses coop dashboard
        else if (role === 'MEMBER') dashboardPath = '/member-dashboard';
        else if (role === 'BUYER') dashboardPath = '/buyer-dashboard';

        navigate(dashboardPath);
      } catch (err: any) {
        // Handle specific error cases
        let errorMessage = err?.message || 'Login failed';

        if (errorMessage.includes('cooperative is still under review') ||
            errorMessage.includes('cooperative is not approved') ||
            errorMessage.includes('pending') ||
            errorMessage.includes('PENDING')) {
          errorMessage = 'Your cooperative registration is still under review. You will receive an email with login credentials once approved by the super admin.';
        }

        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 justify-center mb-6">
            <img src={logo} alt="Smart Cooperative Hub" className="h-12 w-12 rounded" />
            <span className="text-2xl font-bold text-primary">Smart Cooperative Hub</span>
          </Link>

        {/* Single Card Container */}
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 pl-11 bg-background border-border text-foreground"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-[#9DEB15] hover:text-[#9DEB15] font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pl-11 bg-background border-border text-foreground"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-semibold bg-[#9DEB15] hover:bg-[#9DEB15] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-border"></div>

          {/* Create Account Section */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Don't have an account?</p>
            <Link to="/signup">
              <Button
                variant="outline"
                className="w-full h-11 text-base font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Create Account
              </Button>
            </Link>
          </div>
          </div>
        </div>
        
        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            ← Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

