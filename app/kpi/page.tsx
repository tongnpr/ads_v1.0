"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const mockKpiData = [
  { title: "ROAS (Return on Ad Spend)", value: 4.5, target: 4.0, unit: "x" },
  { title: "Conversion Rate", value: 3.2, target: 3.5, unit: "%" },
  { title: "Client Retention", value: 85, target: 90, unit: "%" },
  { title: "New Leads (Monthly)", value: 120, target: 150, unit: " leads" },
];

export default function KpiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">KPI Dashboard</h1>
        <p className="text-muted-foreground">ภาพรวมตัวชี้วัดประสิทธิภาพของทีม</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {mockKpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader>
              <CardTitle className="text-base">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-baseline">
                <p className="text-2xl font-bold">{kpi.value}{kpi.unit}</p>
                <p className="text-sm text-muted-foreground">Target: {kpi.target}{kpi.unit}</p>
              </div>
              <Progress value={(kpi.value / kpi.target) * 100} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}