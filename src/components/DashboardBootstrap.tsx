import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getProfile } from "@/lib/api";
import FullScreenLoader from "./FullScreenLoader";

let hasBootstrappedOnce = false;

export default function DashboardBootstrap() {
	const ranRef = useRef(false);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		// Ensure we only run once per mount and avoid duplicate runs across navigations
		if (ranRef.current || hasBootstrappedOnce) {
			setIsLoading(false);
			return;
		}
		ranRef.current = true;
		hasBootstrappedOnce = true;

		const bootstrap = async () => {
			try {
				// Minimal, safe bootstrap call that proves connectivity and primes auth state
				await getProfile();
				// You can extend this with role-based prefetches if needed
				// e.g., await api.get("/products?limit=5")
			} catch {
				// If profile fetch fails, redirect to login
				navigate("/login", { replace: true });
			} finally {
				setIsLoading(false);
			}
		};
		bootstrap();
	}, []);

	// Render the same full-screen loader used in Dashboard.tsx during bootstrap
	if (isLoading) {
		return <FullScreenLoader message="Loading dashboard..." />;
	}

	return <Outlet />;
}


