import { ModulePage } from "@/components/dashboard/module-page";
import { facultyModules } from "@/data/dashboard-modules";

export default function Page() {
  return <ModulePage module={facultyModules["performance"]} />;
}