import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userName={session.user.name || "Admin"} />
      <main className="flex-1 bg-accent/30 p-6 pt-20 lg:pt-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
