"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ImageIcon, Camera, X } from "lucide-react";
import Image from "next/image";

interface Attendance {
  id: string;
  date: string;
  status: "HADIR" | "IZIN" | "SAKIT";
  description: string | null;
  checkInTime: string;
  photo: string | null;
  user: {
    name: string;
    email: string;
    position: string | null;
  };
}

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const statusBadge = {
  HADIR: { label: "Hadir", className: "bg-green-500" },
  IZIN: { label: "Izin", className: "bg-yellow-500" },
  SAKIT: { label: "Sakit", className: "bg-red-500" },
};

export default function AbsensiAdminPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    status: "all",
    date: "",
  });
  const [photoModal, setPhotoModal] = useState<{
    open: boolean;
    photo: string | null;
    userName: string;
    date: string;
  }>({ open: false, photo: null, userName: "", date: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date) {
        params.set("date", filters.date);
      } else {
        params.set("month", filters.month);
        params.set("year", filters.year);
      }
      if (filters.status !== "all") {
        params.set("status", filters.status);
      }

      const res = await fetch(`/api/admin/attendance?${params}`);
      const data = await res.json();
      setAttendances(data.attendances || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // Generate year options (last 3 years)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Data Absensi</h1>
        <p className="text-muted-foreground">
          Lihat semua data absensi karyawan
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Bulan</Label>
              <Select
                value={filters.month}
                onValueChange={(value) =>
                  setFilters({ ...filters, month: value, date: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tahun</Label>
              <Select
                value={filters.year}
                onValueChange={(value) =>
                  setFilters({ ...filters, year: value, date: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="HADIR">Hadir</SelectItem>
                  <SelectItem value="IZIN">Izin</SelectItem>
                  <SelectItem value="SAKIT">Sakit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Spesifik</Label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
              />
            </div>
          </div>

          {filters.date && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setFilters({ ...filters, date: "" })}
            >
              Reset tanggal
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filters.date
              ? `Absensi ${formatDate(filters.date)}`
              : `Absensi ${monthNames[parseInt(filters.month) - 1]} ${filters.year}`}{" "}
            ({attendances.length} data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Memuat data...
            </p>
          ) : attendances.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Tidak ada data absensi
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Foto</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell>{formatDate(attendance.date)}</TableCell>
                    <TableCell className="font-medium">
                      {attendance.user.name}
                    </TableCell>
                    <TableCell>{attendance.user.position || "-"}</TableCell>
                    <TableCell>{formatTime(attendance.checkInTime)}</TableCell>
                    <TableCell>
                      <Badge
                        className={statusBadge[attendance.status].className}
                      >
                        {statusBadge[attendance.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attendance.photo ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() =>
                            setPhotoModal({
                              open: true,
                              photo: attendance.photo,
                              userName: attendance.user.name,
                              date: formatDate(attendance.date),
                            })
                          }
                        >
                          <Camera className="h-4 w-4" />
                          Lihat
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                          <ImageIcon className="h-4 w-4" />
                          Tidak ada
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {attendance.description || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Photo Modal - Full Screen */}
      <Dialog
        open={photoModal.open}
        onOpenChange={(open) => setPhotoModal({ ...photoModal, open })}
      >
        <DialogContent
          className="flex flex-col"
          style={{ width: "90vw", height: "90vh", maxWidth: "90vw" }}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Foto Absensi - {photoModal.userName}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{photoModal.date}</p>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            {photoModal.photo && (
              <Image
                src={photoModal.photo}
                alt={`Foto absensi ${photoModal.userName}`}
                width={1200}
                height={900}
                className="rounded-lg object-contain max-w-full max-h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
