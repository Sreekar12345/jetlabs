import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AchievementsClient } from "./achievements-client";

export default async function StudentAchievementsPage() {
  const session = await requirePageSession();
  const achievements = await db.achievement.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AchievementsClient
      achievements={JSON.parse(JSON.stringify(achievements))}
      user={{ name: session.user.name || "Student" }}
    />
  );
}
