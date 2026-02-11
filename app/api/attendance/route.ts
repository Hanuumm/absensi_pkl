import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  getIndonesiaDate,
  getIndonesiaMonthStart,
  getIndonesiaMonthEnd,
  getIndonesiaYearMonth,
} from "@/lib/utils";

// GET: Ambil data absensi user
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const currentDate = getIndonesiaYearMonth();
    const targetMonth = month ? parseInt(month) : currentDate.month;
    const targetYear = year ? parseInt(year) : currentDate.year;

    // Start and end of month
    const startDate = getIndonesiaMonthStart(targetYear, targetMonth);
    const endDate = getIndonesiaMonthEnd(targetYear, targetMonth);

    const attendances = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "desc" },
    });

    // Check if user already attended today
    const today = getIndonesiaDate();

    const todayAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    // Count statistics
    const stats = {
      hadir: attendances.filter((a) => a.status === "HADIR").length,
      izin: attendances.filter((a) => a.status === "IZIN").length,
      sakit: attendances.filter((a) => a.status === "SAKIT").length,
    };

    return NextResponse.json({
      attendances,
      todayAttendance,
      stats,
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

// POST: Submit absensi
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, description, photo } = body;

    // Validate status
    if (!["HADIR", "IZIN", "SAKIT"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Validate description for IZIN and SAKIT
    if ((status === "IZIN" || status === "SAKIT") && !description?.trim()) {
      return NextResponse.json(
        { error: "Keterangan wajib diisi untuk izin/sakit" },
        { status: 400 }
      );
    }

    // Get today's date in Indonesia timezone (UTC+7)
    const today = getIndonesiaDate();

    // Check if already attended today using unique constraint
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: "Anda sudah melakukan absensi hari ini" },
        { status: 400 }
      );
    }

    // Create attendance
    const attendance = await prisma.attendance.create({
      data: {
        userId: session.user.id,
        date: today,
        status,
        description: description?.trim() || null,
        photo: photo || null,
      },
    });

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    // Handle unique constraint error (P2002)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Anda sudah melakukan absensi hari ini" },
        { status: 400 }
      );
    }

    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
