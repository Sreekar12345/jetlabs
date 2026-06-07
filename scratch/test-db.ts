import { config } from "dotenv";
import * as path from "path";

console.log("CWD:", process.cwd());
const envPath = path.resolve(process.cwd(), ".env");
console.log("Loading env from:", envPath);

const result = config({ path: envPath });
if (result.error) {
  console.error("Dotenv load error:", result.error);
}

console.log("DATABASE_URL in env:", process.env.DATABASE_URL ? "Exists" : "Missing");
console.log("DIRECT_URL in env:", process.env.DIRECT_URL ? "Exists" : "Missing");

async function main() {
  const { db } = await import("../src/lib/db");
  console.log("Running DB verification test...");
  try {
    // 1. Fetch first student user
    const student = await db.user.findFirst({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        teamId: true,
        verificationStatus: true,
      }
    });

    console.log("Success! Query results:", student);
  } catch (error) {
    console.error("Prisma validation or connection error:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
