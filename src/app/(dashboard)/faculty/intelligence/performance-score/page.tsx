import { PerformanceScoreBoard } from "@/components/dashboard/performance-score-board";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function FacultyPerformanceScorePage() {
  const session = await requireRole("FACULTY");
  const userId = session.user.id;

  let students = await db.user.findMany({
    where: {
      role: "STUDENT",
      memberships: {
        some: {
          team: {
            facultyId: userId,
          },
        },
      },
    },
    include: {
      performance: true,
      submittedSubmissions: true,
      achievements: true,
      memberships: {
        include: {
          team: {
            include: {
              project: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  if (students.length === 0) {
    students = await db.user.findMany({
      where: { role: "STUDENT" },
      include: {
        performance: true,
        submittedSubmissions: true,
        achievements: true,
        memberships: {
          include: {
            team: {
              include: {
                project: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  // Convert Date objects to strings to prevent serialisation issues in React Client Components
  const serializedStudents = JSON.parse(JSON.stringify(students));

  return <PerformanceScoreBoard students={serializedStudents} />;
}

