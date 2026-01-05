import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, LogIn, LogOut, Moon, Sun, ShoppingCart, GitCompare } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { useCompare } from "@/contexts/CompareContext";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { state: cartState } = useCart();
  const { compareProducts } = useCompare();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;
  const marketplacePaths = ["/marketplace", "/buyer-marketplace"];
  const isMarketplaceNavActive = marketplacePaths.includes(location.pathname);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      setIsCheckingAuth(false);
    };

    // Check immediately
    checkAuth();

    // Listen for storage changes (when token is added/removed in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case token is set/removed in same tab
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/');
    setIsMenuOpen(false);
  };

  const isMarketplaceRoute = location.pathname.startsWith("/buyer-marketplace") || location.pathname === "/marketplace";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Smart Cooperative Hub" className="h-10 w-10 rounded" />
            <span className="text-xl md:text-2xl font-bold text-primary">Smart Cooperative Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" onClick={handleNavClick} className={`font-medium pb-1 transition-all ${isActive("/") ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary"}`}>
              Home
            </Link>
            <Link to="/about" onClick={handleNavClick} className={`font-medium pb-1 transition-all ${isActive("/about") ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary"}`}>
              About
            </Link>
            <Link to="/marketplace" onClick={handleNavClick} className={`font-medium pb-1 transition-all ${isMarketplaceNavActive ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary"}`}>
              Marketplace
            </Link>
            <Link to="/features" onClick={handleNavClick} className={`font-medium pb-1 transition-all ${isActive("/features") ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary"}`}>
              Features
            </Link>
            <Link to="/contact" onClick={handleNavClick} className={`font-medium pb-1 transition-all ${isActive("/contact") ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary"}`}>
              Contact
            </Link>
            {isMarketplaceRoute && (
              <>
                {/* Compare Icon */}
                <Link to="/compare" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                    aria-label="Compare products"
                  >
                    <GitCompare className="h-5 w-5" />
                    {compareProducts.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-500 text-white text-xs">
                        {compareProducts.length > 4 ? '4+' : compareProducts.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
                {/* Cart Icon */}
                <Link to="/cart" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                    aria-label="Shopping cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartState.totalItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#b7eb34] text-white text-xs">
                        {cartState.totalItems > 99 ? '99+' : cartState.totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            )}
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="inline-flex items-center justify-center rounded-md border border-border h-9 w-9 hover:bg-accent transition-colors"
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {isCheckingAuth ? (
              <div className="h-9 w-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#8ccc15]"></div>
              </div>
            ) : isAuthenticated ? (
              <Button 
                onClick={handleLogout}
                className="gap-2 bg-[#8ccc15] hover:bg-[#8ccc15] text-white"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="outline"
                    className="gap-2 bg-transparent border-2 border-[#8ccc15] text-[#8ccc15] hover:bg-[#8ccc15]/10 hover:text-[#8ccc15]"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#8ccc15] hover:bg-[#8ccc15] text-white">Get Started</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-4 border-t border-border">
            <Link to="/" onClick={handleNavClick} className={`block w-full text-left font-medium pb-2 border-b-2 transition-all ${isActive("/") ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-primary hover:border-primary"}`}>
              Home
            </Link>
            <Link to="/about" onClick={handleNavClick} className={`block w-full text-left font-medium pb-2 border-b-2 transition-all ${isActive("/about") ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-primary hover:border-primary"}`}>
              About
            </Link>
            <Link to="/marketplace" onClick={handleNavClick} className={`block w-full text-left font-medium pb-2 border-b-2 transition-all ${isMarketplaceNavActive ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-primary hover:border-primary"}`}>
              Marketplace
            </Link>
            <Link to="/features" onClick={handleNavClick} className={`block w-full text-left font-medium pb-2 border-b-2 transition-all ${isActive("/features") ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-primary hover:border-primary"}`}>
              Features
            </Link>
            <Link to="/contact" onClick={handleNavClick} className={`block w-full text-left font-medium pb-2 border-b-2 transition-all ${isActive("/contact") ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-primary hover:border-primary"}`}>
              Contact
            </Link>
            {isMarketplaceRoute && (
              <Link to="/cart" className="w-full" onClick={handleNavClick}>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                  {cartState.totalItems > 0 && (
                    <Badge className="ml-auto bg-[#b7eb34] text-white">
                      {cartState.totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            <button
              aria-label="Toggle theme"
              onClick={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-start gap-2 px-0 py-2 font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {resolvedTheme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </>
              )}
            </button>
            {isCheckingAuth ? (
              <div className="w-full flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#8ccc15]"></div>
              </div>
            ) : isAuthenticated ? (
              <Button 
                onClick={handleLogout}
                className="w-full gap-2 bg-[#8ccc15] hover:bg-[#8ccc15] text-white"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login" className="w-full" onClick={handleNavClick}>
                  <Button 
                    variant="outline"
                    className="w-full gap-2 bg-transparent border-2 border-[#8ccc15] text-[#8ccc15] hover:bg-[#8ccc15]/10 hover:text-[#8ccc15]"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup" className="w-full" onClick={handleNavClick}>
                  <Button className="w-full bg-[#8ccc15] hover:bg-[#8ccc15] text-white">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
