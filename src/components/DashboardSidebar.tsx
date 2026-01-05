import React from "react";
import { NavLink } from "react-router-dom";
import logo from "@/assets/logo.png";
import {
	LayoutDashboard,
	BarChart3,
	Building2,
	Users,
	DollarSign,
	Settings,
	Megaphone,
	FileText,
	ShoppingCart,
	Heart,
	CreditCard,
	Package,
	FileBarChart,
	ShieldCheck,
	CheckCircle,
	Wallet,
	Database,
	Shield,
	Layers,
	Receipt,
	type LucideIcon
} from "lucide-react";

type MenuItem = { label: string; path: string };

// Icon mapping for menu items
const iconMap: Record<string, LucideIcon> = {
	// Super Admin
	"Dashboard": LayoutDashboard,
	"Analytics": BarChart3,
	"Cooperatives": Building2,
	"Users": Users,
	"Financial": DollarSign,
	"System Admin": Database,
	"Content": Layers,
	"Security": Shield,
	"Announcements": Megaphone,
	"Reports": FileText,
	"Settings": Settings,
	
	// Buyer
	"Marketplace": ShoppingCart,
	"Orders": Package,
	"Favorites": Heart,
	"Payments": CreditCard,
	
	// Coop Admin
	"Members": Users,
	"Products": Package,
	"Finances": Wallet,
	
	// Member
	"Contributions": DollarSign,
	"Documents": FileText,
	
	// Regulator
	"Compliance": ShieldCheck,
	"Approvals": CheckCircle,
	
	// Secretary
	"Transactions": Receipt,
};

// Unified color palette - clean and professional
const iconColorMap: Record<string, { bg: string; text: string; hover: string }> = {
	// Super Admin - Blue/Purple theme
	"Dashboard": { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400", hover: "hover:bg-blue-100 dark:hover:bg-blue-950/60" },
	"Analytics": { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400", hover: "hover:bg-purple-100 dark:hover:bg-purple-950/60" },
	"Cooperatives": { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-600 dark:text-indigo-400", hover: "hover:bg-indigo-100 dark:hover:bg-indigo-950/60" },
	"Users": { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-600 dark:text-teal-400", hover: "hover:bg-teal-100 dark:hover:bg-teal-950/60" },
	"Financial": { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", hover: "hover:bg-emerald-100 dark:hover:bg-emerald-950/60" },
	"System Admin": { bg: "bg-slate-50 dark:bg-slate-900/40", text: "text-slate-600 dark:text-slate-400", hover: "hover:bg-slate-100 dark:hover:bg-slate-900/60" },
	"Content": { bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-600 dark:text-cyan-400", hover: "hover:bg-cyan-100 dark:hover:bg-cyan-950/60" },
	"Security": { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-600 dark:text-rose-400", hover: "hover:bg-rose-100 dark:hover:bg-rose-950/60" },
	"Announcements": { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", hover: "hover:bg-amber-100 dark:hover:bg-amber-950/60" },
	"Reports": { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400", hover: "hover:bg-violet-100 dark:hover:bg-violet-950/60" },
	"Settings": { bg: "bg-gray-50 dark:bg-gray-800/40", text: "text-gray-600 dark:text-gray-400", hover: "hover:bg-gray-100 dark:hover:bg-gray-800/60" },
	
	// Buyer - Green/Blue theme
	"Marketplace": { bg: "bg-[#b7eb34]/15 dark:bg-[#b7eb34]/10", text: "text-[#7cb518] dark:text-[#b7eb34]", hover: "hover:bg-[#b7eb34]/25 dark:hover:bg-[#b7eb34]/20" },
	"Orders": { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400", hover: "hover:bg-blue-100 dark:hover:bg-blue-950/60" },
	"Favorites": { bg: "bg-pink-50 dark:bg-pink-950/40", text: "text-pink-600 dark:text-pink-400", hover: "hover:bg-pink-100 dark:hover:bg-pink-950/60" },
	"Payments": { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", hover: "hover:bg-emerald-100 dark:hover:bg-emerald-950/60" },
	
	// Coop Admin - Purple/Amber theme
	"Members": { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400", hover: "hover:bg-violet-100 dark:hover:bg-violet-950/60" },
	"Products": { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", hover: "hover:bg-amber-100 dark:hover:bg-amber-950/60" },
	"Finances": { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", hover: "hover:bg-emerald-100 dark:hover:bg-emerald-950/60" },
	
	// Member - Lime/Sky theme
	"Contributions": { bg: "bg-lime-50 dark:bg-lime-950/40", text: "text-lime-600 dark:text-lime-400", hover: "hover:bg-lime-100 dark:hover:bg-lime-950/60" },
	"Documents": { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-600 dark:text-sky-400", hover: "hover:bg-sky-100 dark:hover:bg-sky-950/60" },
	
	// Regulator - Red/Green theme
	"Compliance": { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-600 dark:text-rose-400", hover: "hover:bg-rose-100 dark:hover:bg-rose-950/60" },
	"Approvals": { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", hover: "hover:bg-emerald-100 dark:hover:bg-emerald-950/60" },
	
	// Secretary - Blue theme
	"Transactions": { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400", hover: "hover:bg-blue-100 dark:hover:bg-blue-950/60" },
};

function getIconForMenuItem(label: string): LucideIcon {
	return iconMap[label] || LayoutDashboard;
}

function getIconColor(label: string) {
	return iconColorMap[label] || { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", hover: "hover:bg-gray-200 dark:hover:bg-gray-700" };
}

function classNames(...classes: Array<string | boolean | undefined>) {
	return classes.filter(Boolean).join(" ");
}

export default function DashboardSidebar({ menu, isMobile = false, onClose }: { menu: MenuItem[]; isMobile?: boolean; onClose?: () => void }) {
	if (!menu || menu.length === 0) {
		return null;
	}

	return (
		<aside className="w-full h-full flex flex-col bg-card">
			{/* Fixed Logo Section with hover effect */}
			<div className={`group flex-shrink-0 border-b border-border/40 hover:border-[#b7eb34]/30 transition-colors duration-300 cursor-pointer ${
				isMobile ? 'px-3 py-4 justify-center' : 'px-6 py-5'
			}`}>
				<div className={`flex items-center transition-all duration-300 group-hover:gap-3 ${
					isMobile ? 'justify-center gap-0' : 'gap-2.5'
				}`}>
					<div className="relative">
						<img src={logo} alt="logo" className={`flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(183,235,52,0.4)] ${
							isMobile ? 'h-8 w-8' : 'h-9 w-9'
						}`} />
						<div className="absolute inset-0 rounded-full bg-[#b7eb34]/0 group-hover:bg-[#b7eb34]/10 transition-all duration-300 blur-md -z-10" />
					</div>
					{!isMobile && (
						<span className="font-semibold text-base text-foreground transition-colors duration-300 group-hover:text-[#b7eb34]">Smart Cooperative Hub</span>
					)}
				</div>
			</div>
			{/* Scrollable Navigation */}
			<nav className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#b7eb34]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#b7eb34]/30 ${
				isMobile ? 'px-2 py-4' : 'px-4 py-4'
			}`}>
				<ul className="space-y-2">
					{menu.map((item) => {
						if (!item || !item.label || !item.path) {
							return null;
						}
						const Icon = getIconForMenuItem(item.label);
						const colors = getIconColor(item.label);
						return (
							<li key={item.path}>
								<NavLink
									to={item.path}
									onClick={() => {
										if (isMobile && onClose) {
											onClose();
										}
									}}
									className={({ isActive, isPending }) => {
										return classNames(
											`group flex items-center rounded-lg text-sm transition-all duration-300 ease-out relative cursor-pointer overflow-hidden ${
												isMobile ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
											}`,
											"hover:cursor-pointer active:cursor-pointer",
											isActive
												? `${colors.bg} ${colors.text} font-semibold shadow-sm`
												: `text-muted-foreground ${colors.hover} hover:text-foreground`,
											isPending && "opacity-60"
										);
									}}
									style={{ cursor: 'pointer' }}
									title={isMobile ? item.label : undefined}
								>
									{({ isActive }) => (
										<>
											{/* Animated gradient background on hover */}
											<div className="absolute inset-0 bg-gradient-to-r from-[#b7eb34]/0 via-[#b7eb34]/0 to-[#b7eb34]/0 group-hover:from-[#b7eb34]/5 group-hover:via-[#b7eb34]/8 group-hover:to-[#b7eb34]/5 dark:group-hover:from-[#b7eb34]/10 dark:group-hover:via-[#b7eb34]/15 dark:group-hover:to-[#b7eb34]/10 transition-all duration-500 rounded-lg -z-0" />
											
											{/* Shimmer effect on hover - smooth sweep */}
											<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -z-0" />
											
											{/* Icon container with innovative hover effects */}
											<div className={`relative p-1.5 rounded-md ${colors.bg} transition-all duration-300 z-10 ${
												isActive 
													? 'ring-2 ring-[#b7eb34]/30 shadow-[0_0_0_2px_rgba(183,235,52,0.1)]' 
													: 'group-hover:ring-2 group-hover:ring-[#b7eb34]/30 group-hover:shadow-[0_0_0_2px_rgba(183,235,52,0.1)] group-hover:bg-gradient-to-br group-hover:from-[#b7eb34]/10 group-hover:to-transparent'
											}`}>
												<Icon className={`h-4 w-4 flex-shrink-0 ${colors.text} transition-all duration-300 ${
													isActive 
														? 'text-[#b7eb34]' 
														: 'group-hover:text-[#b7eb34] group-hover:drop-shadow-[0_0_4px_rgba(183,235,52,0.4)]'
												}`} strokeWidth={2.5} />
												
												{/* Pulsing dot for active state with glow */}
												{isActive && (
													<div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-[#b7eb34] rounded-full animate-pulse">
														<div className="absolute inset-0 bg-[#b7eb34] rounded-full animate-ping opacity-75" />
													</div>
												)}
											</div>
											
											{/* Label with smooth slide animation - hidden on mobile */}
											{!isMobile && (
												<span className={`flex-1 font-medium relative z-10 transition-all duration-300 ${
													isActive 
														? 'translate-x-0 text-[#b7eb34]' 
														: 'group-hover:translate-x-0.5 group-hover:font-semibold'
												}`}>
													{item.label}
												</span>
											)}
											
											{/* Active indicator with glow */}
											{isActive && (
												<>
													<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#b7eb34] rounded-r-full shadow-[0_0_8px_rgba(183,235,52,0.6)] animate-in slide-in-from-left duration-300" />
													<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#b7eb34] via-[#8ccc15] to-[#b7eb34] rounded-r-full opacity-50 blur-sm" />
												</>
											)}
											
											{/* Hover indicator arrow with smooth animation */}
											<div className={`absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-3 group-hover:translate-x-0 z-10 ${
												isActive ? 'opacity-0' : ''
											}`}>
												<svg className="w-4 h-4 text-[#b7eb34] drop-shadow-[0_0_4px_rgba(183,235,52,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
												</svg>
											</div>
											
											{/* Ripple effect on click */}
											<div className="absolute inset-0 rounded-lg bg-[#b7eb34]/0 group-active:bg-[#b7eb34]/20 transition-all duration-300 scale-0 group-active:scale-100 -z-0" />
										</>
									)}
								</NavLink>
							</li>
						);
					})}
				</ul>
			</nav>
		</aside>
	);
}


