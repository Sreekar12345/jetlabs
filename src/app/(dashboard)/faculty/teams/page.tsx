import { FacultyTeamExecutionView } from "@/components/dashboard/faculty-team-execution-view";
import { facultyModules } from "@/data/dashboard-modules";

export default function Page() {
  return <FacultyTeamExecutionView module={facultyModules["teams"]} />;
}
