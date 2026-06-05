import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function FacultyAnalyticsPage() {
  return <ModulePage module={dashboardModules["/faculty/analytics"]} />;
}
