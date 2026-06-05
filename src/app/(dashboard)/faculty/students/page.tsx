import { FacultyStudentIntelligenceView } from "@/components/dashboard/faculty-student-intelligence-view";
import { facultyModules } from "@/data/dashboard-modules";

export default function Page() {
  return <FacultyStudentIntelligenceView module={facultyModules["students"]} />;
}
