import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-accent/30">
      <DashboardHeader
        userName={session.user.name || "User"}
        userRole={session.user.role}
      />
      <main className="max-w-4xl mx-auto p-6">{children}</main>
    </div>
  );
}
