import { db } from "../src/lib/db";

async function run() {
  console.log("Measuring db query with relationLoadStrategy: join...");
  
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
    relationLoadStrategy: "join", // Use database joins
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
  console.log(`Prisma query with JOIN took: ${(endDb - startDb).toFixed(2)}ms`);
  
  await db.$disconnect();
}

run().catch(console.error);
