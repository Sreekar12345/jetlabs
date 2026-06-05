import { Submission } from "@prisma/client";
import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { PerformanceClient } from "./performance-client";

export default async function StudentPerformancePage() {
  const session = await requirePageSession();
  const userId = session.user.id;

  const performanceRecord = await db.performance.findUnique({
    where: { userId },
  });

  const performance = performanceRecord ?? {
    score: 0,
    attendanceScore: 0,
    submissionScore: 0,
    reviewScore: 0,
  };

  // Live database-calculated leaderboard ranking
  const rank = await db.performance.count({
    where: { score: { gt: performance.score } },
  }) + 1;

  const totalUsers = await db.user.count({ where: { role: "STUDENT" } });
  const percentile = totalUsers > 0 ? Math.max(1, Math.round((rank / totalUsers) * 100)) : 100;

  // Retrieve submissions history for evolution logs
  const member = await db.teamMember.findFirst({
    where: { userId },
    include: {
      team: {
        include: {
          submissions: {
            orderBy: { submittedAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  const submissions = member?.team?.submissions ?? [];
  const historyItems = submissions.map((sub: Submission, index: number) => ({
    week: `Cycle ${submissions.length - index}`,
    title: sub.title,
    status: sub.status === "APPROVED" ? "Approved" : sub.status === "REVISION_REQUIRED" ? "Revision Required" : "Submitted",
    date: new Date(sub.submittedAt).toLocaleDateString(),
  }));

  return (
    <PerformanceClient
      user={{ name: session.user.name ?? "Student" }}
      performance={performance}
      rank={rank}
      percentile={percentile}
      historyItems={historyItems}
    />
  );
}
