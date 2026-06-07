import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ProfileClient } from "./profile-client";

export default async function StudentProfilePage() {
  const session = await requirePageSession();
  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      performance: true,
      achievements: true,
      memberships: {
        include: {
          team: {
            include: {
              project: true,
              faculty: {
                select: { name: true },
              },
              submissions: {
                orderBy: { submittedAt: "desc" },
                take: 10,
                include: {
                  submittedBy: {
                    select: { name: true },
                  },
                  reviewedBy: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // Derive structures safely
  const member = user.memberships[0] ?? null;
  const team = member?.team ?? null;
  const milestones = team
    ? await db.projectMilestone.findMany({
        where: { projectId: team.projectId },
        orderBy: { position: "asc" },
      })
    : [];

  const performance = user.performance ?? {
    score: 0,
    attendanceScore: 0,
    submissionScore: 0,
    reviewScore: 0,
  };

  const achievements = user.achievements ?? [];
  const submissions = team?.submissions ?? [];

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        parentPhoneNumber: user.parentPhoneNumber,
        linkedinUrl: user.linkedinUrl,
        skills: user.skills,
        bio: user.bio,
        verificationStatus: user.verificationStatus,
        verifiedBy: user.verifiedBy,
        verifiedAt: user.verifiedAt ? user.verifiedAt.toISOString() : null,
        correctionRequestedAt: user.correctionRequestedAt ? user.correctionRequestedAt.toISOString() : null,
        rollNumber: user.rollNumber,
        department: user.department,
        batchYear: user.batchYear,
      }}
      performance={performance}
      achievements={JSON.parse(JSON.stringify(achievements))}
      team={team ? JSON.parse(JSON.stringify(team)) : null}
      milestones={JSON.parse(JSON.stringify(milestones))}
      submissions={JSON.parse(JSON.stringify(submissions))}
    />
  );
}
