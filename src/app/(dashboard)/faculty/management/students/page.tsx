import { FacultyStudentIntelligenceView } from "@/components/dashboard/faculty-student-intelligence-view";
import { dashboardModules } from "@/data/dashboard-modules";

export default function FacultyStudentsPage() {
  return (
    <FacultyStudentIntelligenceView
      module={dashboardModules["/faculty/management/students"]}
    />
  );
}
