import { getStudentDashboardData } from "../src/lib/services/dashboard-service";
import { db } from "../src/lib/db";

async function run() {
  console.log("Measuring db query and service performance...");
  
  // Find a student
  const student = await db.user.findFirst({
    where: { role: "STUDENT" }
  });
  
  if (!student) {
    console.log("No student found!");
    return;
  }
  
  console.log(`Profiling for student: ${student.name} (${student.id})`);
  
  const startDb = performance.now();
  const record = await db.user.findUnique({
    where: { id: student.id },
    include: {
      performance: true,
      achievements: true,
      memberships: {
        include: {
          team: {
            include: {
              faculty: true,
              students: {
                include: { user: true }
              },
              project: {
                include: {
                  milestones: true,
                  analytics: true,
                }
              },
              submissions: {
                include: {
                  submittedBy: true,
                  reviewedBy: true,
                  reviews: true
                }
              },
              activityEvents: true
            }
          }
        }
      }
    }
  });
  const endDb = performance.now();
  console.log(`Prisma query took: ${(endDb - startDb).toFixed(2)}ms`);
  
  const startService = performance.now();
  const data = await getStudentDashboardData(student.id);
  const endService = performance.now();
  console.log(`Full getStudentDashboardData took: ${(endService - startService).toFixed(2)}ms`);
  
  await db.$disconnect();
}

run().catch(console.error);
