// app/api/user/settings/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const { type, currentPassword, newPassword, theme, themeColor } = await request.json()

    const userId = parseInt(session.user.id)

    if (type === "password") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "กรุณากรอกรหัสผ่านให้ครบถ้วน" },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
          { status: 400 }
        )
      }

      // ตรวจสอบรหัสผ่านปัจจุบัน
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 })
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password)
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
          { status: 400 }
        )
      }

      // เข้ารหัสรหัสผ่านใหม่
      const hashedNewPassword = await bcrypt.hash(newPassword, 12)

      // อัปเดตรหัสผ่าน
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      })

      // ปิดเซสชั่นทั้งหมดของผู้ใช้ (ยกเว้นเซสชั่นปัจจุบัน)
      await prisma.userSession.updateMany({
        where: { 
          userId: userId,
          id: { not: session.sessionId as string }
        },
        data: { isActive: false }
      })

      return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" })

    } else if (type === "theme") {
      // อัปเดตธีม
      await prisma.user.update({
        where: { id: userId },
        data: { 
          theme: theme || "light",
          themeColor: themeColor || "blue"
        }
      })

      return NextResponse.json({ 
        message: "เปลี่ยนธีมสำเร็จ",
        theme,
        themeColor 
      })
    }

    return NextResponse.json({ error: "ประเภทการอัปเดตไม่ถูกต้อง" }, { status: 400 })

  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    )
  }
}