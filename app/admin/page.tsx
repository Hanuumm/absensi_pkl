"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Check, Clock, AlertCircle, Calendar } from "lucide-react";

interface RecentAttendance {
  id: string;
  status: "HADIR" | "IZIN" | "SAKIT";
  description: string | null;
  checkInTime: string;
  user: {
    name: string;
    email: string;
    position: string | null;
  };
}

interface DashboardData {
  totalEmployees: number;
  todayStats: { hadir: number; izin: number; sakit: number };
  monthlyStats: { hadir: number; izin: number; sakit: number };
  recentAttendance: RecentAttendance[];
  month: number;
  year: number;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const statusBadge = {
    HADIR: { label: "Hadir", className: "bg-green-500" },
    IZIN: { label: "Izin", className: "bg-yellow-500" },
    SAKIT: { label: "Sakit", className: "bg-red-500" },
  };

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
    <div className="space-y-6 max-w-6xl">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Karyawan</p>
                <p className="text-2xl font-bold">{data.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hadir Hari Ini</p>
                <p className="text-2xl font-bold">{data.todayStats.hadir}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Izin Hari Ini</p>
                <p className="text-2xl font-bold">{data.todayStats.izin}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sakit Hari Ini</p>
                <p className="text-2xl font-bold">{data.todayStats.sakit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Statistik {monthNames[data.month - 1]} {data.year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{data.monthlyStats.hadir}</p>
              <p className="text-sm text-muted-foreground">Total Hadir</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">{data.monthlyStats.izin}</p>
              <p className="text-sm text-muted-foreground">Total Izin</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{data.monthlyStats.sakit}</p>
              <p className="text-sm text-muted-foreground">Total Sakit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Absensi Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentAttendance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada absensi hari ini
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentAttendance.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell className="font-medium">
                      {attendance.user.name}
                    </TableCell>
                    <TableCell>{attendance.user.position || "-"}</TableCell>
                    <TableCell>
                      {new Date(attendance.checkInTime).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge[attendance.status].className}>
                        {statusBadge[attendance.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {attendance.description || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
