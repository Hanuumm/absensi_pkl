"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

interface Attendance {
  id: string;
  date: string;
  status: "HADIR" | "IZIN" | "SAKIT";
  description: string | null;
  checkInTime: string;
  photo: string | null;
}

interface AttendanceHistoryProps {
  attendances: Attendance[];
}

export function AttendanceHistory({ attendances }: AttendanceHistoryProps) {
  const statusBadge = {
    HADIR: { label: "Hadir", variant: "default" as const, className: "bg-green-500 hover:bg-green-600" },
    IZIN: { label: "Izin", variant: "default" as const, className: "bg-yellow-500 hover:bg-yellow-600" },
    SAKIT: { label: "Sakit", variant: "default" as const, className: "bg-red-500 hover:bg-red-600" },
  };

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (attendances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Belum ada data absensi bulan ini
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Riwayat Absensi</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Foto</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances.map((attendance) => (
              <TableRow key={attendance.id}>
                <TableCell className="font-medium">
                  {formatDate(attendance.date)}
                </TableCell>
                <TableCell>{formatTime(attendance.checkInTime)}</TableCell>
                <TableCell>
                  <Badge className={statusBadge[attendance.status].className}>
                    {statusBadge[attendance.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {attendance.photo ? (
                    <a href={attendance.photo} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={attendance.photo}
                        alt="Foto absensi"
                        width={50}
                        height={50}
                        className="rounded object-cover hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ) : (
                    <div className="flex items-center text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {attendance.description || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
