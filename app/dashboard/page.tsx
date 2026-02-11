"use client";

import { useEffect, useState, useCallback } from "react";
import { AttendanceForm } from "@/components/attendance-form";
import { AttendanceStats } from "@/components/attendance-stats";
import { AttendanceHistory } from "@/components/attendance-history";

interface Attendance {
  id: string;
  date: string;
  status: "HADIR" | "IZIN" | "SAKIT";
  description: string | null;
  checkInTime: string;
  photo: string | null;
}

interface AttendanceData {
  attendances: Attendance[];
  todayAttendance: Attendance | null;
  stats: { hadir: number; izin: number; sakit: number };
  month: number;
  year: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Memuat data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-destructive">Gagal memuat data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <AttendanceForm
        todayAttendance={data.todayAttendance}
        onSuccess={fetchData}
      />

      <AttendanceStats
        stats={data.stats}
        month={data.month}
        year={data.year}
      />

      <AttendanceHistory attendances={data.attendances} />
    </div>
  );
}
