"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockHolidays = [
  { date: "2025-08-12", holiday: "วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสิริกิติ์ฯ (วันแม่แห่งชาติ)" },
  { date: "2025-10-13", holiday: "วันคล้ายวันสวรรคต ร.9" },
  { date: "2025-10-23", holiday: "วันปิยมหาราช" },
  { date: "2025-12-05", holiday: "วันคล้ายวันพระบรมราชสมภพ ร.9 (วันพ่อแห่งชาติ)" },
  { date: "2025-12-10", holiday: "วันรัฐธรรมนูญ" },
  { date: "2025-12-31", holiday: "วันสิ้นปี" },
];

const teamLeaves = [
    { name: "สมชาย", startDate: "2025-08-14", endDate: "2025-08-15", type: "ลากิจ" },
    { name: "มานี", startDate: "2025-08-20", endDate: "2025-08-20", type: "ลาป่วย" },
]

export default function HolidaysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Holidays & Leaves</h1>
        <p className="text-muted-foreground">ปฏิทินวันหยุดและวันลาของทีม</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader><CardTitle>วันหยุดนักขัตฤกษ์</CardTitle></CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {mockHolidays.map(h => (
                        <li key={h.date} className="flex justify-between items-center">
                            <span>{h.holiday}</span>
                            <span className="text-sm text-muted-foreground">{new Date(h.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>ตารางวันลาของทีม</CardTitle></CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {teamLeaves.map(l => (
                        <li key={l.name+l.startDate} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span>{l.name}</span>
                                <Badge variant="secondary">{l.type}</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">{new Date(l.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short'})} - {new Date(l.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short'})}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}