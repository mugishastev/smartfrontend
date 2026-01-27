import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import FeaturesPage from "./pages/FeaturesPage";
import ContactPage from "./pages/ContactPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/dashboard/Dashboard";
import UsersPage from "./pages/dashboard/UsersPage";
import CooperativePage from "./pages/dashboard/CooperativePage";
import Payments from "./pages/dashboard/Payments";
import SettingsPage from "./pages/dashboard/SettingsPage";
import BuyerDashboard from "./pages/dashboard/BuyerDashboard";
import BuyerMarketplace from "./pages/dashboard/BuyerMarketplace";
import BuyerOrders from "./pages/dashboard/BuyerOrders";
import BuyerFavorites from "./pages/dashboard/BuyerFavorites";
import BuyerPayments from "./pages/dashboard/BuyerPayments";
import BuyerSettingsPage from "./pages/dashboard/BuyerSettingsPage";
import CartPage from "./pages/dashboard/CartPage";
import WishlistPage from "./pages/dashboard/WishlistPage";
import ReturnRequestsPage from "./pages/dashboard/ReturnRequestsPage";
import CompareProductsPage from "./pages/dashboard/CompareProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CoopAdminDashboard from "./pages/dashboard/CoopAdminDashboard";
import CoopMembers from "./pages/dashboard/CoopMembers";
import CoopProducts from "./pages/dashboard/CoopProducts";
import CoopFinances from "./pages/dashboard/CoopFinances";
import CoopAnnouncements from "./pages/dashboard/CoopAnnouncements";
import MemberDashboard from "./pages/dashboard/MemberDashboard";
import MemberContributions from "./pages/dashboard/MemberContributions";
import MemberRequests from "./pages/dashboard/MemberRequests";
import MemberProducts from "./pages/dashboard/MemberProducts";
import MemberAnnouncements from "./pages/dashboard/MemberAnnouncements";
import MemberDocuments from "./pages/dashboard/MemberDocuments";
import RegulatorDashboard from "./pages/dashboard/RegulatorDashboard";
import RegulatorCooperatives from "./pages/dashboard/RegulatorCooperatives";
import RegulatorReports from "./pages/dashboard/RegulatorReports";
import RegulatorCompliance from "./pages/dashboard/RegulatorCompliance";
import RegulatorApprovals from "./pages/dashboard/RegulatorApprovals";
import SecretaryDashboard from "./pages/dashboard/SecretaryDashboard";
import SecretaryTransactions from "./pages/dashboard/SecretaryTransactions";
import SecretaryReports from "./pages/dashboard/SecretaryReports";
import CoopSettingsPage from "./pages/dashboard/CoopSettingsPage";
import MemberSettingsPage from "./pages/dashboard/MemberSettingsPage";
import SecretarySettingsPage from "./pages/dashboard/SecretarySettingsPage";
import AccountantSettingsPage from "./pages/dashboard/AccountantSettingsPage";
import AccountantDashboard from "./pages/dashboard/AccountantDashboard";
import AccountantTransactions from "./pages/dashboard/AccountantTransactions";
import AddMember from "./pages/dashboard/AddMember";
import EditMember from "./pages/dashboard/EditMember";
import AddProduct from "./pages/dashboard/AddProduct";
import AddAnnouncement from "./pages/dashboard/AddAnnouncement";
import AddBuyerOrder from "./pages/dashboard/AddBuyerOrder";
import SecurityDashboard from "./pages/dashboard/SecurityDashboard";
import Reports from "./pages/dashboard/Reports";
import NotFound from "./pages/NotFound";
import DashboardBootstrap from "./components/DashboardBootstrap";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { RecentlyViewedProvider } from "./contexts/RecentlyViewedContext";
import { CompareProvider } from "./contexts/CompareContext";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <RecentlyViewedProvider>
        <CompareProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Public Marketplace - accessible without login */}
                  <Route path="/marketplace" element={<BuyerMarketplace />} />
                  <Route path="/buyer-marketplace" element={<BuyerMarketplace />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />

                  {/* All dashboard-related routes protected, bootstrapped, and with common layout */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardBootstrap />}>
                      <Route element={<DashboardLayout />}>
                        {/* Super Admin Routes */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/cooperatives" element={<CooperativePage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/security" element={<SecurityDashboard />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings/*" element={<SettingsPage />} />

                        {/* Buyer Routes */}
                        <Route path="/buyer-dashboard" element={<BuyerDashboard />}>
                          <Route path="settings" element={<BuyerSettingsPage />} />
                        </Route>
                        <Route path="/buyer-marketplace" element={<BuyerMarketplace />} />
                        <Route path="/buyer-orders" element={<BuyerOrders />} />
                        <Route path="/buyer-orders/add" element={<AddBuyerOrder />} />
                        <Route path="/buyer-cart" element={<CartPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/buyer-favorites" element={<BuyerFavorites />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/compare" element={<CompareProductsPage />} />
                        <Route path="/returns" element={<ReturnRequestsPage />} />
                        <Route path="/buyer-payments" element={<BuyerPayments />} />
                        <Route path="/buyer-settings" element={<BuyerSettingsPage />} />

                        {/* Accountant Routes */}
                        <Route path="/accountant-dashboard" element={<AccountantDashboard />} />
                        <Route path="/accountant-transactions" element={<AccountantTransactions />} />
                        <Route path="/accountant-settings" element={<AccountantSettingsPage />} />

                        {/* Coop Admin Routes */}
                        <Route path="/coop-dashboard" element={<CoopAdminDashboard />} />
                        <Route path="/coop-members" element={<CoopMembers />} />
                        <Route path="/coop-members/add" element={<AddMember />} />
                        <Route path="/member/:id/edit" element={<EditMember />} />
                        <Route path="/coop-products" element={<CoopProducts />} />
                        <Route path="/coop-products/add" element={<AddProduct />} />
                        <Route path="/coop-finances" element={<CoopFinances />} />
                        <Route path="/coop-announcements" element={<CoopAnnouncements />} />
                        <Route path="/coop-announcements/add" element={<AddAnnouncement />} />
                        <Route path="/coop-settings" element={<CoopSettingsPage />} />

                        {/* Member Routes */}
                        <Route path="/member-dashboard" element={<MemberDashboard />} />
                        <Route path="/member-contributions" element={<MemberContributions />} />
                        <Route path="/member-requests" element={<MemberRequests />} />
                        <Route path="/member-products" element={<MemberProducts />} />
                        <Route path="/member-announcements" element={<MemberAnnouncements />} />
                        <Route path="/member-announcements/add" element={<AddAnnouncement />} />
                        <Route path="/member-documents" element={<MemberDocuments />} />
                        <Route path="/member-settings" element={<MemberSettingsPage />} />

                        {/* Regulator Routes */}
                        <Route path="/regulator-dashboard" element={<RegulatorDashboard />} />
                        <Route path="/regulator-cooperatives" element={<RegulatorCooperatives />} />
                        <Route path="/regulator-reports" element={<RegulatorReports />} />
                        <Route path="/regulator-compliance" element={<RegulatorCompliance />} />
                        <Route path="/regulator-approvals" element={<RegulatorApprovals />} />

                        {/* Secretary Routes */}
                        <Route path="/secretary-dashboard" element={<SecretaryDashboard />} />
                        <Route path="/secretary-transactions" element={<SecretaryTransactions />} />
                        <Route path="/secretary-reports" element={<SecretaryReports />} />
                        <Route path="/secretary-settings" element={<SecretarySettingsPage />} />
                        {/* Secretary can also view members for oversight */}
                        <Route path="/coop-members" element={<CoopMembers />} />

                        <Route path="/announcements/add" element={<AddAnnouncement />} />
                      </Route>
                    </Route>
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </CompareProvider>
      </RecentlyViewedProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
