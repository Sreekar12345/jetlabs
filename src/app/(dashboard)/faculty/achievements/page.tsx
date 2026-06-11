import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AchievementAnalyticsBoard } from "@/components/dashboard/achievement-analytics-board";

export default async function AchievementsPage() {
  await requirePageSession();

  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    include: {
      achievements: true,
    },
  });

  const achievementStudents = students.map((student) => {
    const achievements = student.achievements ?? [];
    const items = achievements.length;
    const points = achievements.reduce((sum, ach) => sum + ach.points, 0);
    const initials = student.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const research = achievements.filter((ach) =>
      /research|paper|ieee|publication|conference|journal/i.test(`${ach.title} ${ach.description}`)
    ).length;

    const national = achievements.filter((ach) =>
      /national|hackathon|first|winner|prize|competition|award/i.test(`${ach.title} ${ach.description}`)
    ).length;

    return {
      name: student.name,
      roll: student.rollNumber ?? `ST-${student.id.slice(-6).toUpperCase()}`,
      dept: student.department ?? "Computer Science",
      initials,
      items,
      points,
      research,
      national,
      batch: student.batchYear ?? "2026",
    };
  });

  return <AchievementAnalyticsBoard students={achievementStudents} />;
}