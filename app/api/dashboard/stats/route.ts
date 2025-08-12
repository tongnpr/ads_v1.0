import { NextResponse } from "next/server";
import { PrismaClient, UserSession } from "@prisma/client"; // Import UserSession
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Define a type for the user object we are processing
type UserWithSession = {
  id: number;
  username: string;
  sessions: UserSession[];
};

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
        loginTime: 'desc',
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
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
    
    // **THE FIX IS HERE**
    // Add the type annotation ': UserWithSession' to the user parameter
    const userStatuses = usersWithStatus.map((user: UserWithSession) => {
      const latestSession = user.sessions[0];
      let status = "Offline";
      let lastSeen = null;

      if (latestSession) {
        lastSeen = latestSession.createdAt;
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