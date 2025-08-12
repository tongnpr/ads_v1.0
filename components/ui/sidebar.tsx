"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Home,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  History,
  Users,
  Monitor as MonitorIcon,
  Target,
  CalendarDays
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/overview", icon: Home },
  { name: "Adser", href: "/adser", icon: Users },
  { name: "Monitor", href: "/monitor", icon: MonitorIcon },
  { name: "KPI", href: "/kpi", icon: Target },
  { name: "Holidays", href: "/holidays", icon: CalendarDays },
  { name: "History", href: "/history", icon: History },
  { name: "ตั้งค่า", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed, toggleCollapse } = useSidebar();

  useEffect(() => {
    // ปิดเมนูมือถืออัตโนมัติเมื่อมีการเปลี่ยนหน้า
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [pathname]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-card border-r transition-all duration-300 ease-in-out flex flex-col",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          "transform",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* User info */}
        <div className="flex items-center gap-3 h-20 border-b flex-shrink-0 px-6 pt-4">
            <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center w-full" : "")}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                    <User className="h-5 w-5" />
                </div>
                <div className={cn("transition-all duration-200 overflow-hidden", isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full")}>
                    <p className="text-sm font-medium truncate">{session?.user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">ผู้ใช้งาน</p>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isCollapsed && "justify-center",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className={cn("transition-opacity duration-200 whitespace-nowrap", isCollapsed && "opacity-0 hidden")}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Toggle Button */}
        <div className="hidden lg:block border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={toggleCollapse}
          >
            <Menu className="h-4 w-4 flex-shrink-0" />
            <span className={cn("transition-opacity duration-200 whitespace-nowrap", isCollapsed && "opacity-0 hidden")}>
              ย่อ/ขยาย
            </span>
          </Button>
        </div>

        {/* Sign out button */}
        <div className="border-t p-4">
          <Button
            variant="destructive"
            className={cn("w-full justify-start gap-3", isCollapsed && "justify-center")}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className={cn("transition-opacity duration-200 whitespace-nowrap", isCollapsed && "opacity-0 hidden")}>ออกจากระบบ</span>
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}