import { StudentVerificationTable } from "@/features/student-verification/components/StudentVerificationTable";

export const metadata = {
  title: "Student Verification | Faculty Dashboard | JetLabs",
  description: "Verify and manage student registration information and profile changes.",
};

export default function FacultyStudentVerificationPage() {
  return <StudentVerificationTable />;
}
