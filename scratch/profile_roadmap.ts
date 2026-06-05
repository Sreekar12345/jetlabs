import { getStudentRoadmap } from "../src/lib/services/dashboard-service";
import { db } from "../src/lib/db";

async function run() {
  console.log("Measuring optimized roadmap query performance...");
  
  // Find a student
  const student = await db.user.findFirst({
    where: { role: "STUDENT" }
  });
  
  if (!student) {
    console.log("No student found!");
    return;
  }
  
  console.log(`Profiling roadmap for student: ${student.name} (${student.id})`);
  
  const startService = performance.now();
  const data = await getStudentRoadmap(student.id);
  const endService = performance.now();
  console.log(`getStudentRoadmap took: ${(endService - startService).toFixed(2)}ms`);
  console.log(`Loaded ${data.length} roadmap milestones.`);
  
  await db.$disconnect();
}

run().catch(console.error);
