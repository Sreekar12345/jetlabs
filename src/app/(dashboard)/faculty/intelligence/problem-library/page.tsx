import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function ProblemLibraryPage() {
  return <ModulePage module={dashboardModules["/faculty/intelligence/problem-library"]} />;
}
