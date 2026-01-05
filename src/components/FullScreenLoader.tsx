import React from "react";

export default function FullScreenLoader({ message = "Loading dashboard..." }: { message?: string }) {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#8ccc15] mx-auto mb-4"></div>
				<p className="text-gray-600">{message}</p>
			</div>
		</div>
	);
}


