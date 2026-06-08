import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  console.log("=========================================");
  console.log("STARTING DEVELOPMENT DATABASE CLEANUP...");
  console.log("=========================================");

  try {
    // 1. Count existing records in each table
    const reviewCount = await db.review.count();
    const submissionCount = await db.submission.count();
    const teamMemberCount = await db.teamMember.count();
    const activityEventCount = await db.activityEvent.count();
    const teamAssignmentRequestCount = await db.teamAssignmentRequest.count();
    const performanceCount = await db.performance.count();
    const achievementCount = await db.achievement.count();
    const problemBookmarkCount = await db.problemBookmark.count();
    const teamCount = await db.team.count();
    const projectMilestoneCount = await db.projectMilestone.count();
    const analyticsSnapshotCount = await db.analyticsSnapshot.count();
    const projectCount = await db.project.count();
    const problemCount = await db.problem.count();
    const userCount = await db.user.count();
    const studentChangeLogCount = await db.studentChangeLog.count();
    const notificationCount = await db.notification.count();

    const initialCounts = {
      Review: reviewCount,
      Submission: submissionCount,
      TeamMember: teamMemberCount,
      ActivityEvent: activityEventCount,
      TeamAssignmentRequest: teamAssignmentRequestCount,
      Performance: performanceCount,
      Achievement: achievementCount,
      ProblemBookmark: problemBookmarkCount,
      Team: teamCount,
      ProjectMilestone: projectMilestoneCount,
      AnalyticsSnapshot: analyticsSnapshotCount,
      Project: projectCount,
      Problem: problemCount,
      User: userCount,
      StudentChangeLog: studentChangeLogCount,
      Notification: notificationCount,
    };

    console.log("Current record counts before deletion:", initialCounts);

    // 2. Perform deletion sequentially to avoid constraint violations and transaction timeouts
    console.log("\nDeleting records sequentially...");
    
    console.log("- Deleting Reviews...");
    await db.review.deleteMany();
    
    console.log("- Deleting Submissions...");
    await db.submission.deleteMany();
    
    console.log("- Deleting TeamMembers...");
    await db.teamMember.deleteMany();
    
    console.log("- Deleting ActivityEvents...");
    await db.activityEvent.deleteMany();
    
    console.log("- Deleting TeamAssignmentRequests...");
    await db.teamAssignmentRequest.deleteMany();
    
    console.log("- Deleting Performances...");
    await db.performance.deleteMany();
    
    console.log("- Deleting Achievements...");
    await db.achievement.deleteMany();
    
    console.log("- Deleting ProblemBookmarks...");
    await db.problemBookmark.deleteMany();
    
    console.log("- Deleting Teams...");
    await db.team.deleteMany();
    
    console.log("- Deleting ProjectMilestones...");
    await db.projectMilestone.deleteMany();
    
    console.log("- Deleting AnalyticsSnapshots...");
    await db.analyticsSnapshot.deleteMany();
    
    console.log("- Deleting Projects...");
    await db.project.deleteMany();
    
    console.log("- Deleting Problems...");
    await db.problem.deleteMany();
    
    console.log("- Deleting Users...");
    await db.user.deleteMany();
    
    console.log("- Deleting StudentChangeLogs...");
    await db.studentChangeLog.deleteMany();
    
    console.log("- Deleting Notifications...");
    await db.notification.deleteMany();

    console.log("=========================================");
    console.log("CLEANUP COMPLETED SUCCESSFULLY!");
    console.log("=========================================");
    console.log("\nNumber of records deleted per table:");
    for (const [table, count] of Object.entries(initialCounts)) {
      console.log(`- ${table}: ${count} records deleted`);
    }
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("Unhandled execution error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
