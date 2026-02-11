"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock, AlertCircle } from "lucide-react";

interface AttendanceStatsProps {
  stats: {
    hadir: number;
    izin: number;
    sakit: number;
  };
  month: number;
  year: number;
}

export function AttendanceStats({ stats, month, year }: AttendanceStatsProps) {
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const statItems = [
    { label: "Hadir", value: stats.hadir, icon: Check, color: "text-green-600", bg: "bg-green-100" },
    { label: "Izin", value: stats.izin, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Sakit", value: stats.sakit, icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg">
        Rekap {monthNames[month - 1]} {year}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 text-center">
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${item.bg} ${item.color} mb-2`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
