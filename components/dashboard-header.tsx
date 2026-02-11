"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
}

export function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-lg font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-semibold">{userName}</h1>
            <p className="text-sm opacity-80">
              {userRole === "ADMIN" ? "Administrator" : "Karyawan"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </Button>
      </div>
    </header>
  );
}
