"use client";

import { createContext, useState, useContext, ReactNode } from 'react';

// สร้าง Interface สำหรับ Context ที่จะใช้
interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

// สร้าง Context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// สร้าง Provider เพื่อครอบแอปพลิเคชัน
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false); // สถานะเริ่มต้นคือ "ไม่ย่อ" (เปิดเต็มที่)

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

// สร้าง custom hook เพื่อให้เรียกใช้งานได้ง่าย
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}