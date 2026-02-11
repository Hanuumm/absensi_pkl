import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  getIndonesiaMonthStart,
  getIndonesiaMonthEnd,
  getIndonesiaYearMonth,
} from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const currentDate = getIndonesiaYearMonth();
    const targetMonth = month ? parseInt(month) : currentDate.month;
    const targetYear = year ? parseInt(year) : currentDate.year;

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (date) {
      // Filter by specific date - parse as UTC date
      const [y, m, d] = date.split("-").map(Number);
      where.date = new Date(Date.UTC(y, m - 1, d));
    } else {
      // Filter by month
      const startDate = getIndonesiaMonthStart(targetYear, targetMonth);
      const endDate = getIndonesiaMonthEnd(targetYear, targetMonth);
      where.date = { gte: startDate, lte: endDate };
    }

    if (status && ["HADIR", "IZIN", "SAKIT"].includes(status)) {
      where.status = status;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, position: true },
        },
      },
      orderBy: [{ date: "desc" }, { checkInTime: "desc" }],
    });

    return NextResponse.json({
      attendances,
      month: targetMonth,
      year: targetYear,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
