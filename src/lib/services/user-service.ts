import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import type { AuthUser } from "@/types/auth";
import type { RegisterInput } from "@/validations/auth";

function mapAuthUser(user: {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  avatar: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
}

export async function createUserAccount(input: RegisterInput) {
  const role = input.role ?? "STUDENT";
  if (role !== "STUDENT" && role !== "FACULTY" && role !== "ADMIN") {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const user = await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: role,
        phoneNumber: input.phoneNumber ?? null,
        department: input.department ?? null,
        batchYear: input.batchYear ?? null,
        rollNumber: input.rollNumber ?? null,
        specialization: input.specialization ?? null,
        ...(role === "STUDENT" ? {
          performance: {
            create: {
              score: 0,
              attendanceScore: 0,
              submissionScore: 0,
              reviewScore: 0,
            },
          },
        } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    return mapAuthUser(user);
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    throw error;
  }
}
