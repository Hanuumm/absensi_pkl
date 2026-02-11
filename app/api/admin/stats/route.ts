import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  getIndonesiaDate,
  getIndonesiaMonthStart,
  getIndonesiaMonthEnd,
  getIndonesiaYearMonth,
} from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current date info in Indonesia timezone
    const { year, month } = getIndonesiaYearMonth();
    const today = getIndonesiaDate();
    const startOfMonth = getIndonesiaMonthStart(year, month);
    const endOfMonth = getIndonesiaMonthEnd(year, month);

    // Total employees (excluding admin)
    const totalEmployees = await prisma.user.count({
      where: { role: "USER" },
    });

    // Today's attendance
    const todayAttendance = await prisma.attendance.groupBy({
      by: ["status"],
      where: { date: today },
      _count: { status: true },
    });

    const todayStats = {
      hadir: todayAttendance.find((a) => a.status === "HADIR")?._count.status || 0,
      izin: todayAttendance.find((a) => a.status === "IZIN")?._count.status || 0,
      sakit: todayAttendance.find((a) => a.status === "SAKIT")?._count.status || 0,
    };

    // Monthly attendance
    const monthlyAttendance = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _count: { status: true },
    });

    const monthlyStats = {
      hadir: monthlyAttendance.find((a) => a.status === "HADIR")?._count.status || 0,
      izin: monthlyAttendance.find((a) => a.status === "IZIN")?._count.status || 0,
      sakit: monthlyAttendance.find((a) => a.status === "SAKIT")?._count.status || 0,
    };

    // Recent attendance with user info
    const recentAttendance = await prisma.attendance.findMany({
      where: { date: today },
      include: {
        user: {
          select: { name: true, email: true, position: true },
        },
      },
      orderBy: { checkInTime: "desc" },
      take: 10,
    });

    return NextResponse.json({
      totalEmployees,
      todayStats,
      monthlyStats,
      recentAttendance,
      month,
      year,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
