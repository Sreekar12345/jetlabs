import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { BacklogAnalyticsBoard } from "@/components/dashboard/backlog-analytics-board";

function getBacklogsForStudent(student: { id: string; name: string; score: number }) {
  const score = student.score;
  const backlogs: any[] = [];
  
  if (score < 50) {
    // Critical: 5+ backlogs
    backlogs.push(
      { subject: "Discrete Mathematics", code: "MA204", semester: 3, attempts: 2, status: "Pending", internal: 14, external: 18 },
      { subject: "Operating Systems", code: "CS305", semester: 5, attempts: 2, status: "Pending", internal: 12, external: 22 },
      { subject: "Database Systems", code: "CS306", semester: 5, attempts: 3, status: "Pending", internal: 11, external: 19 },
      { subject: "Computer Networks", code: "CS404", semester: 6, attempts: 2, status: "Pending", internal: 13, external: 19 },
      { subject: "Theory of Computation", code: "CS403", semester: 6, attempts: 1, status: "Pending", internal: 10, external: 16 }
    );
  } else if (score < 68) {
    // High: 3-4 backlogs
    backlogs.push(
      { subject: "Discrete Mathematics", code: "MA204", semester: 3, attempts: 2, status: "Pending", internal: 14, external: 18 },
      { subject: "Operating Systems", code: "CS305", semester: 5, attempts: 1, status: "Pending", internal: 12, external: 22 },
      { subject: "Probability & Statistics", code: "MA305", semester: 5, attempts: 1, status: "Cleared", internal: 22, external: 30, dateCleared: "2025-07-04" },
      { subject: "Database Systems", code: "CS306", semester: 5, attempts: 2, status: "Cleared", internal: 18, external: 23, dateCleared: "2025-08-12" }
    );
  } else if (score < 78) {
    // Moderate: 1-2 backlogs
    backlogs.push(
      { subject: "Engineering Math III", code: "MA301", semester: 3, attempts: 1, status: "Pending", internal: 15, external: 20 },
      { subject: "Database Systems", code: "CS306", semester: 5, attempts: 2, status: "Cleared", internal: 18, external: 23, dateCleared: "2025-08-12" }
    );
  } else {
    // Stable: 0 backlogs (or cleared backlog)
    if (student.name.charCodeAt(0) % 2 === 0) {
      backlogs.push(
        { subject: "Probability & Statistics", code: "MA305", semester: 5, attempts: 1, status: "Cleared", internal: 22, external: 30, dateCleared: "2025-07-04" }
      );
    }
  }
  
  return backlogs;
}

export default async function BacklogsPage() {
  const session = await requirePageSession();
  const userId = session.user.id;

  // Fetch all teams mentored by this faculty
  const mentoredTeams = await db.team.findMany({
    where: { facultyId: userId },
    select: { id: true },
  });
  
  const teamIds = mentoredTeams.map((t) => t.id);

  // Fetch students in those teams
  let students = await db.user.findMany({
    where: {
      role: "STUDENT",
      memberships: {
        some: {
          teamId: { in: teamIds },
        },
      },
    },
    include: {
      performance: true,
      memberships: {
        include: {
          team: true,
        },
      },
    },
  });

  // Fallback: If no students are assigned, fetch all students
  if (students.length === 0) {
    students = await db.user.findMany({
      where: { role: "STUDENT" },
      include: {
        performance: true,
        memberships: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  const backlogStudents: any[] = [];
  const backlogRecords: any[] = [];

  students.forEach((student) => {
    const score = student.performance?.score ?? 0;
    const studentBacklogs = getBacklogsForStudent({
      id: student.id,
      name: student.name,
      score,
    });

    const activeCount = studentBacklogs.filter((b) => b.status === "Pending").length;
    const clearedCount = studentBacklogs.filter((b) => b.status === "Cleared").length;
    
    let severity = "Stable";
    if (activeCount >= 5) severity = "Critical";
    else if (activeCount >= 3) severity = "High";
    else if (activeCount >= 1) severity = "Moderate";

    // Mapped scores: array of size 8 representing backlog counts per semester
    const scores = Array(8).fill(0);
    const clearedSems: Record<number, boolean> = {};

    studentBacklogs.forEach((b) => {
      const sem = b.semester;
      scores[sem - 1]++;
      if (b.status === "Cleared") {
        clearedSems[sem] = true;
      }
    });

    backlogStudents.push({
      name: student.name,
      roll: student.rollNumber ?? `ST-${student.id.slice(-6).toUpperCase()}`,
      dept: student.department ?? "Computer Science",
      scores,
      active: activeCount,
      cleared: clearedCount,
      severity,
      clearedSems,
    });

    studentBacklogs.forEach((b) => {
      backlogRecords.push({
        student: student.name,
        roll: student.rollNumber ?? `ST-${student.id.slice(-6).toUpperCase()}`,
        dept: student.department ?? "Computer Science",
        subject: b.subject,
        code: b.code,
        sem: `${b.semester}`,
        year: `${Math.ceil(b.semester / 2)}`,
        acadYear: b.academicYear || `202${3 + Math.floor((b.semester - 1) / 2)}-${24 + Math.floor((b.semester - 1) / 2)}`,
        internal: b.internal,
        external: b.external,
        total: b.internal + b.external,
        attempts: `${b.attempts}`,
        status: b.status,
        dateCleared: b.dateCleared ?? "",
      });
    });
  });

  return <BacklogAnalyticsBoard students={backlogStudents} records={backlogRecords} />;
}