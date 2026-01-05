import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Menu } from "lucide-react";
import { User } from "@/lib/types";
import { logout } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function DashboardHeader({ 
  user, 
  title, 
  onMenuClick,
  showMenuButton = false 
}: { 
  user: User | null; 
  title?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials = (firstName?.[0] ?? "") + (lastName?.[0] ?? "");
  const displayName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : firstName || lastName || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background pt-4">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {title ? "Dashboard • " + title : "Dashboard"}
            </p>
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">{title ?? "Overview"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="group relative inline-flex items-center justify-center rounded-md border border-border h-9 w-9 hover:bg-[#b7eb34]/10 hover:border-[#b7eb34]/30 transition-colors duration-200"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 transition-colors duration-200 group-hover:text-[#b7eb34]" />
            ) : (
              <Moon className="h-4 w-4 transition-colors duration-200 group-hover:text-[#b7eb34]" />
            )}
          </button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none group">
              <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-[#b7eb34]/30 transition-all duration-200">
                <AvatarImage src={user?.avatar} alt={displayName} />
                <AvatarFallback className="group-hover:bg-[#b7eb34]/10 transition-colors duration-200">{initials || "U"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-sm">
                {user && (
                  <>
                    <div className="font-semibold">{displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email || "No email"}</div>
                  </>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/settings">Settings</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/profile">Profile</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
