"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockAdserData = [
  { id: 1, name: "สมชาย ใจดี", team: "Alpha", status: "Active", spend: 150000 },
  { id: 2, name: "สมหญิง รักดี", team: "Bravo", status: "Active", spend: 250000 },
  { id: 3, name: "ประชา สุขใจ", team: "Alpha", status: "Inactive", spend: 50000 },
  { id: 4, name: "มานี มีนา", team: "Charlie", status: "Active", spend: 320000 },
];

export default function AdserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adser Management</h1>
        <p className="text-muted-foreground">จัดการข้อมูลและประสิทธิภาพของ Adser</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อ Adser</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>ทีม</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">Spend (THB)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAdserData.map((adser) => (
                <TableRow key={adser.id}>
                  <TableCell className="font-medium">{adser.name}</TableCell>
                  <TableCell>{adser.team}</TableCell>
                  <TableCell>
                    <Badge variant={adser.status === "Active" ? "default" : "outline"}>
                      {adser.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {adser.spend.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}