"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";
import { SessionChecker } from "@/components/session-checker";
import { useSidebar } from "@/contexts/SidebarContext";
import { Providers } from "@/components/providers"; // <-- Import Providers
import "./globals.css";

// Component ที่มี Logic การแสดงผลหลัก
function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    if (status === "loading") return;
    // ตรวจสอบ pathname ปัจจุบัน ถ้าไม่ใช่หน้า login และไม่มี session ให้ redirect
    if (!session && window.location.pathname !== '/login') {
      router.push("/login");
    }
  }, [session, status, router]);

  // ถ้ากำลังโหลด หรือยังไม่มี session (และไม่ใช่หน้า login) ให้แสดงหน้า loading
  if (status === "loading" || (!session && window.location.pathname !== '/login')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg">กำลังโหลด...</p>
      </div>
    );
  }

  // ถ้าไม่มี session และอยู่ที่หน้า login ให้แสดง children (หน้า login)
  if (!session) {
    return <>{children}</>;
  }

  // ถ้ามี session ให้แสดง Dashboard Layout
  return (
    <div className="relative min-h-screen bg-background">
      <SessionChecker />
      <Sidebar />
      <main className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// RootLayout หลัก ทำหน้าที่แค่สร้างโครงสร้างและ Provider
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}