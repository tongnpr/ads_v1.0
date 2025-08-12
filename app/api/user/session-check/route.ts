// app/api/user/session-check/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.sessionId) {
      return NextResponse.json({ valid: false, message: "เซสชั่นหมดอายุ หรือมีการเข้าระบบจากอุปกรณ์อื่น" })
    }

    // ตรวจสอบเซสชั่นในฐานข้อมูล
    const userSession = await prisma.userSession.findUnique({
      where: { id: session.sessionId as string }
    })

    if (!userSession || !userSession.isActive || userSession.expires < new Date()) {
      return NextResponse.json({ 
        valid: false, 
        message: "มีการเข้าสู่ระบบจากอุปกรณ์อื่น หรือ Session ของคุณหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง" 
      })
    }

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ 
      valid: false, 
      message: "เกิดข้อผิดพลาดในการตรวจสอบเซสชั่น" 
    })
  }
}