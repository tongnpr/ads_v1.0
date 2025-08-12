import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  try {
    const totalUsers = await prisma.user.count();

    const recentActivities = await prisma.loginLog.findMany({
      take: 5,
      orderBy: {
        loginTime: 'desc', // <-- จุดแก้ไขที่ 1: เปลี่ยนจาก createdAt เป็น loginTime
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const usersWithStatus = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        sessions: {
          orderBy: {
            // !!! สำคัญ: ตรวจสอบชื่อฟิลด์ใน schema.prisma ของคุณสำหรับตาราง UserSession
            // อาจจะเป็น createdAt, updatedAt หรือชื่ออื่น
            createdAt: 'desc', // <-- จุดแก้ไขที่ 2: หากมี Error ให้เปลี่ยนเป็นชื่อฟิลด์วันที่ที่ถูกต้อง
          },
          take: 1,
        },
      },
    });
    
    const userStatuses = usersWithStatus.map(user => {
      const latestSession = user.sessions[0];
      let status = "Offline";
      let lastSeen = null;

      if (latestSession) {
        // !!! สำคัญ: ตรวจสอบชื่อฟิลด์ใน schema.prisma ของคุณ
        lastSeen = latestSession.createdAt; // <-- จุดแก้ไขที่ 3: หากมี Error ให้เปลี่ยนเป็นชื่อฟิลด์วันที่ที่ถูกต้อง
        
        const isOnline = latestSession.isActive && new Date(latestSession.expires) > new Date();
        if (isOnline) {
          status = "Online";
        }
      }
      
      return {
        id: user.id,
        username: user.username,
        status,
        lastSeen,
      };
    });

    return NextResponse.json({
      totalUsers,
      recentActivities,
      userStatuses,
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}