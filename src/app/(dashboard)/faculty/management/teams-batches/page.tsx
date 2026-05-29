import { FacultyTeamExecutionView } from "@/components/dashboard/faculty-team-execution-view";
import { dashboardModules } from "@/data/dashboard-modules";

export default function FacultyTeamsBatchesPage() {
  return (
    <FacultyTeamExecutionView
      module={dashboardModules["/faculty/management/teams-batches"]}
    />
  );
}
