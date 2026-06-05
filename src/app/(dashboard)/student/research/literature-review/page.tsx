import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function LiteratureReviewPage() {
  return <ModulePage module={dashboardModules["/student/research/literature-review"]} />;
}
