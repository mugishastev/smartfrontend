import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FullScreenLoader from "./FullScreenLoader";
import { User } from "@/lib/types";
import { logout, getProfile } from "@/lib/api";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

type MenuItem = { label: string; path: string };
type Role = User["role"];

function classNames(...classes: Array<string | boolean | undefined>) {
	return classes.filter(Boolean).join(" ");
}

export default function DashboardLayout() {
	const location = useLocation();
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

	useEffect(() => {
		const init = async () => {
			try {
				// Try local cache first for faster paint
				const cached = localStorage.getItem("user");
				if (cached) {
					try {
						const cachedUser = JSON.parse(cached);
						if (cachedUser && (cachedUser.firstName || cachedUser.email)) {
							setUser(cachedUser);
							setIsLoading(false);
						}
					} catch (e) {
						console.error("Failed to parse cached user:", e);
					}
				}
				// Always validate/refresh in background
				const res = await getProfile();
				if (res?.data) {
				// res.data is already the User object (extracted from { user: {...} } in getProfile)
				const userData = res.data;
				if (userData && (userData.email || userData.firstName || userData.id)) {
						setUser(userData);
						localStorage.setItem("user", JSON.stringify(userData));
					} else {
						// Invalid user data
						setUser(null);
						localStorage.removeItem("user");
					}
				} else {
					// Clear user if no data returned
					setUser(null);
					localStorage.removeItem("user");
				}
			} catch (error: any) {
				console.error("Failed to load user profile:", error);
				// If profile fails, keep user null and allow downstream routes to handle auth redirects
			} finally {
				setIsLoading(false);
			}
		};
		init();
	}, []);

	const role: Role | undefined = user?.role;

	// Fallback role deduction from current path to ensure menu shows even before profile resolves
	function deriveRoleFromPath(pathname: string): Role | undefined {
		if (pathname.startsWith("/buyer-") || pathname === "/buyer-dashboard") return "BUYER";
		if (pathname.startsWith("/coop-") || pathname === "/coop-dashboard") return "COOP_ADMIN";
		if (pathname.startsWith("/member-") || pathname === "/member-dashboard") return "MEMBER";
		if (pathname.startsWith("/regulator-") || pathname === "/regulator-dashboard") return "RCA_REGULATOR";
		if (pathname.startsWith("/secretary-") || pathname === "/secretary-dashboard") return "SECRETARY";
		// Super Admin routes
		if (pathname === "/dashboard" ||
		    pathname === "/cooperatives" ||
		    pathname === "/users" ||
		    pathname === "/security" ||
		    pathname === "/reports" ||
		    pathname === "/settings") return "SUPER_ADMIN";
		return undefined;
	}

	const effectiveRole: Role | undefined = role ?? deriveRoleFromPath(location.pathname);

	const menu: MenuItem[] = useMemo(() => {
		switch (effectiveRole) {
			case "SUPER_ADMIN":
				return [
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Cooperatives", path: "/cooperatives" },
					{ label: "Users", path: "/users" },
					{ label: "Security", path: "/security" },
					{ label: "Reports", path: "/reports" },
					{ label: "Settings", path: "/settings" }
				];
			case "BUYER":
				return [
					{ label: "Dashboard", path: "/buyer-dashboard" },
					{ label: "Marketplace", path: "/buyer-marketplace" },
					{ label: "Orders", path: "/buyer-orders" },
					{ label: "Favorites", path: "/buyer-favorites" },
					{ label: "Payments", path: "/buyer-payments" },
					{ label: "Settings", path: "/buyer-settings" }
				];
			case "COOP_ADMIN":
				return [
					{ label: "Dashboard", path: "/coop-dashboard" },
					{ label: "Members", path: "/coop-members" },
					{ label: "Products", path: "/coop-products" },
					{ label: "Finances", path: "/coop-finances" },
					{ label: "Announcements", path: "/coop-announcements" },
					{ label: "Settings", path: "/coop-settings" }
				];
			case "MEMBER":
				return [
					{ label: "Dashboard", path: "/member-dashboard" },
					{ label: "Contributions", path: "/member-contributions" },
					{ label: "Products", path: "/member-products" },
					{ label: "Announcements", path: "/member-announcements" },
					{ label: "Documents", path: "/member-documents" },
					{ label: "Settings", path: "/member-settings" }
				];
			case "RCA_REGULATOR":
				return [
					{ label: "Dashboard", path: "/regulator-dashboard" },
					{ label: "Cooperatives", path: "/regulator-cooperatives" },
					{ label: "Reports", path: "/regulator-reports" },
					{ label: "Compliance", path: "/regulator-compliance" },
					{ label: "Approvals", path: "/regulator-approvals" }
				];
			case "SECRETARY":
				return [
					{ label: "Dashboard", path: "/secretary-dashboard" },
					{ label: "Transactions", path: "/secretary-transactions" },
					{ label: "Reports", path: "/secretary-reports" },
					{ label: "Members", path: "/coop-members" },
					{ label: "Settings", path: "/secretary-settings" }
				];
			case "ACCOUNTANT":
				return [
					{ label: "Dashboard", path: "/accountant-dashboard" },
					{ label: "Finances", path: "/coop-finances" },
					{ label: "Members", path: "/coop-members" },
					{ label: "Settings", path: "/accountant-settings" }
				];
			default:
				// No sidebar items for unauth/unknown role
				return [];
		}
	}, [effectiveRole, location.pathname]);

	function getPageTitle(pathname: string): string {
		if (pathname.startsWith("/buyer-dashboard")) return "Buyer • Dashboard";
		if (pathname.startsWith("/buyer-marketplace")) return "Buyer • Marketplace";
		if (pathname.startsWith("/buyer-orders")) return "Buyer • Orders";
		if (pathname.startsWith("/buyer-favorites")) return "Buyer • Favorites";
		if (pathname.startsWith("/buyer-payments")) return "Buyer • Payments";
		if (pathname.startsWith("/coop-dashboard")) return "Cooperative • Dashboard";
		if (pathname.startsWith("/coop-members")) return "Cooperative • Members";
		if (pathname.startsWith("/coop-products")) return "Cooperative • Products";
		if (pathname.startsWith("/coop-finances")) return "Cooperative • Finances";
		if (pathname.startsWith("/coop-announcements")) return "Cooperative • Announcements";
		if (pathname.startsWith("/member-dashboard")) return "Member • Dashboard";
		if (pathname.startsWith("/member-contributions")) return "Member • Contributions";
		if (pathname.startsWith("/member-products")) return "Member • Products";
		if (pathname.startsWith("/member-announcements")) return "Member • Announcements";
		if (pathname.startsWith("/member-documents")) return "Member • Documents";
		if (pathname.startsWith("/regulator-dashboard")) return "Regulator • Dashboard";
		if (pathname.startsWith("/regulator-cooperatives")) return "Regulator • Cooperatives";
		if (pathname.startsWith("/regulator-reports")) return "Regulator • Reports";
		if (pathname.startsWith("/regulator-compliance")) return "Regulator • Compliance";
		if (pathname.startsWith("/regulator-approvals")) return "Regulator • Approvals";
		if (pathname.startsWith("/secretary-dashboard")) return "Secretary • Dashboard";
		if (pathname.startsWith("/secretary-transactions")) return "Secretary • Transactions";
		if (pathname.startsWith("/secretary-reports")) return "Secretary • Reports";
		if (pathname.startsWith("/secretary-settings")) return "Secretary • Settings";
		if (pathname.startsWith("/coop-settings")) return "Cooperative • Settings";
		if (pathname.startsWith("/member-settings")) return "Member • Settings";
		if (pathname.startsWith("/accountant-dashboard")) return "Accountant • Dashboard";
		if (pathname.startsWith("/accountant-settings")) return "Accountant • Settings";
		if (pathname.startsWith("/buyer-settings")) return "Buyer • Settings";
		if (pathname === "/dashboard") return "Super Admin • Dashboard";
		if (pathname.startsWith("/cooperatives")) return "Super Admin • Cooperatives";
		if (pathname.startsWith("/users")) return "Super Admin • Users";
		if (pathname.startsWith("/security")) return "Super Admin • Security";
		if (pathname.startsWith("/reports")) return "Super Admin • Reports";
		if (pathname.startsWith("/settings")) return "Settings";
		return "Overview";
	}

	if (isLoading) {
		return <FullScreenLoader message="Loading dashboard..." />;
	}

	return (
		<div className="min-h-screen bg-background flex">
			{/* Desktop Sidebar - fixed position, always visible on md+ */}
			{menu.length > 0 && (
				<div className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-card z-40">
					<DashboardSidebar menu={menu} isMobile={false} />
				</div>
			)}

			{/* Mobile Sidebar - icon only, slide in from left */}
			{menu.length > 0 && (
				<>
					{/* Overlay */}
					{isMobileSidebarOpen && (
						<div 
							className="fixed inset-0 bg-black/50 z-40 md:hidden"
							onClick={() => setIsMobileSidebarOpen(false)}
						/>
					)}
					{/* Mobile Sidebar */}
					<div className={`
						fixed left-0 top-0 h-screen bg-card z-50 transition-transform duration-300 ease-in-out md:hidden
						${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
					`}>
						<div className="w-20">
							<DashboardSidebar 
								menu={menu} 
								isMobile={true}
								onClose={() => setIsMobileSidebarOpen(false)}
							/>
						</div>
					</div>
				</>
			)}

			{/* Main area - offset for fixed sidebar */}
			<div className={`flex-1 min-w-0 flex flex-col ${menu.length > 0 ? 'md:ml-64' : ''}`}>
				<DashboardHeader 
					user={user} 
					title={getPageTitle(location.pathname)}
					onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
					showMenuButton={menu.length > 0}
				/>
				<div className="px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4">
					<Outlet />
				</div>
			</div>
		</div>
	);
}


