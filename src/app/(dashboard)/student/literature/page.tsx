import { ModulePage } from "@/components/dashboard/module-page";
import { studentModules } from "@/data/dashboard-modules";

export default function Page() {
  return <ModulePage module={studentModules["literature"]} />;
}