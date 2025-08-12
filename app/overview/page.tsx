"use client"

import { useSession } from "next-auth/react"

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          ยินดีต้อนรับ, {session?.user?.username}!
        </p>
      </div>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg h-96 flex items-center justify-center">
        <p className="text-muted-foreground">
          พื้นที่สำหรับข้อมูล overview หลัก
        </p>
      </div>
    </div>
  )
}