"use client"

import { createContext, useContext, useEffect } from "react"
import { useSession } from "next-auth/react"

type Theme = "light" | "dark"
type ThemeColor = "blue" | "green" | "purple" | "red" | "orange" | "rose" | "yellow" | "violet" | "cyan" | "gray"

interface ThemeContextType {
  theme: Theme
  themeColor: ThemeColor
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { data: session } = useSession()

  // ดึงค่ามาจาก session โดยตรง ถ้าไม่มีให้ใช้ค่าเริ่มต้น
  const theme = (session?.user?.theme as Theme) || 'light'
  const themeColor = (session?.user?.themeColor as ThemeColor) || 'blue'

  useEffect(() => {
    const root = window.document.documentElement

    // 1. จัดการ Light/Dark mode
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    // 2. จัดการ Theme Color
    const colorClasses = [
      "theme-blue", "theme-green", "theme-purple", "theme-red", "theme-orange",
      "theme-rose", "theme-yellow", "theme-violet", "theme-cyan", "theme-gray"
    ];
    root.classList.remove(...colorClasses) // ลบ class สีเก่าทั้งหมดออกก่อน
    root.classList.add(`theme-${themeColor}`) // เพิ่ม class สีใหม่ที่ถูกต้อง

  }, [theme, themeColor]) // ให้ useEffect ทำงานใหม่ทุกครั้งที่ค่า theme หรือ themeColor จาก session เปลี่ยน

  return (
    <ThemeContext.Provider value={{ theme, themeColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}