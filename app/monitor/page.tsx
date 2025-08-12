"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockMonitorData = [
    { name: "Server A", status: "Online", cpu: "25%", memory: "60%" },
    { name: "Database Server", status: "Online", cpu: "15%", memory: "45%" },
    { name: "Ad API", status: "Warning", cpu: "85%", memory: "70%" },
    { name: "Billing Service", status: "Offline", cpu: "0%", memory: "0%" },
]

export default function MonitorPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Monitor</h1>
                <p className="text-muted-foreground">ตรวจสอบสถานะของระบบแบบเรียลไทม์</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {mockMonitorData.map(service => (
                    <Card key={service.name}>
                        <CardHeader>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className={`h-3 w-3 rounded-full ${
                                    service.status === 'Online' ? 'bg-green-500' :
                                    service.status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></span>
                                <p className="font-semibold">{service.status}</p>
                            </div>
                            <div className="mt-4 text-sm text-muted-foreground">
                                <p>CPU: {service.cpu}</p>
                                <p>Memory: {service.memory}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}