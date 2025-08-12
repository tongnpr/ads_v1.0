// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      )
    }

    // ตรวจสอบความยาวของ username และ password
    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้ต้องมีความยาว 3-50 ตัวอักษร" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      )
    }

    // ตรวจสอบว่า username นี้มีอยู่แล้วหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      )
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 12)

    // สร้างผู้ใช้ใหม่
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    })

    return NextResponse.json({
      message: "สมัครสมาชิกสำเร็จ",
      user: {
        id: user.id,
        username: user.username
      }
    })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    )
  }
}