// components/session-checker.tsx
"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SessionChecker() {
  const { data: session, status } = useSession()
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  useEffect(() => {
    if (status !== "authenticated" || !session) return

    const checkSession = async () => {
      try {
        const response = await fetch("/api/user/session-check")
        const result = await response.json()
        
        if (!result.valid) {
          setAlertMessage(result.message || "Session ของคุณหมดอายุ")
          setShowAlert(true)
        }
      } catch (error) {
        console.error("Session check error:", error)
      }
    }

    // ตรวจสอบเซสชั่นทุก 30 วินาที
    const interval = setInterval(checkSession, 30000)

    return () => clearInterval(interval)
  }, [session, status])

  const handleSessionExpired = () => {
    setShowAlert(false)
    signOut({ callbackUrl: "/login" })
  }

  return (
    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>แจ้งเตือนระบบ</AlertDialogTitle>
          <AlertDialogDescription>
            {alertMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleSessionExpired}>
            ตกลง
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}