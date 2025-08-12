"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from "@/lib/utils"; // <-- เพิ่ม import ที่นี่

// Type definitions for our data
interface ActivityLog {
  id: number;
  user: { username: string };
  status: string;
  createdAt: string;
}

interface UserStatus {
  id: number;
  username: string;
  status: 'Online' | 'Offline';
  lastSeen: string | null;
}

interface DashboardData {
  totalUsers: number;
  recentActivities: ActivityLog[];
  userStatuses: UserStatus[];
}

// Helper function to format time
const formatTimeAgo = (dateString: string | null) => {
  if (!dateString) return 'ไม่เคย';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: th });
};

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result: DashboardData = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on initial load
    const interval = setInterval(fetchData, 30000); // Re-fetch every 30 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>กำลังโหลดข้อมูล Dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return <p>ไม่สามารถโหลดข้อมูลได้</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History & Status</h1>
        <p className="text-muted-foreground">
          ยินดีต้อนรับ, {session?.user?.username}! นี่คือภาพรวมกิจกรรมและสถานะผู้ใช้
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ผู้ใช้ทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">จำนวนบัญชีในระบบ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ผู้ใช้ออนไลน์</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userStatuses.filter(u => u.status === 'Online').length}</div>
            <p className="text-xs text-muted-foreground">จำนวนผู้ใช้ที่กำลังใช้งาน</p>
          </CardContent>
        </Card>
      </div>

      {/* Activities and User Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />สถานะผู้ใช้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.userStatuses.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("h-2.5 w-2.5 rounded-full", user.status === 'Online' ? 'bg-green-500' : 'bg-gray-400')} />
                  <p className="text-sm font-medium">{user.username}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.status === 'Online' ? 'ออนไลน์' : `ใช้งานล่าสุด ${formatTimeAgo(user.lastSeen)}`}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />กิจกรรมล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.status === 'success' ? 'เข้าสู่ระบบสำเร็จ' : 'เข้าสู่ระบบไม่สำเร็จ'}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTimeAgo(activity.createdAt)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}