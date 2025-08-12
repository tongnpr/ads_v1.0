"use client";

import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProvider } from "@/components/providers/theme-provider"; // <-- 1. Import ThemeProvider

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SidebarProvider>
        {/* 2. นำ ThemeProvider มาครอบ children */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </SidebarProvider>
    </SessionProvider>
  );
}