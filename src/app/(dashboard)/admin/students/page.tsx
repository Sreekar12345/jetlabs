import { requirePageRole } from "@/lib/auth/session";
import { AdminControlCenter } from "@/components/dashboard/admin-control-center";
import { getAdminStudents } from "@/lib/services/admin-service";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminStudentsPage() {
  await requirePageRole("ADMIN");

  const students = await getAdminStudents();

  // Convert Date objects to strings to prevent serialisation issues in React Client Components
  const serializedStudents = JSON.parse(JSON.stringify(students));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tracking-tight text-2xl font-black text-slate-900">Admin Control Center</h1>
          <p className="text-slate-500 text-sm">
            Centralized platform oversight, user management directories, telemetry, and audit logs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-slate-900 text-white hover:bg-slate-850 font-bold rounded-xl shadow-sm h-10 px-4">
            <Link href="/admin/analytics">Platform Analytics</Link>
          </Button>
        </div>
      </div>

      <AdminControlCenter
        initialTab="students"
        students={serializedStudents}
      />
    </div>
  );
}
