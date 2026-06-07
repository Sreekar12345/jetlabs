import { db } from "@/lib/db";
import { VerificationStatus } from "@prisma/client";
import { AuditLogService } from "./AuditLogService";

export type EditStudentFieldsInput = {
  rollNumber?: string | null;
  parentPhoneNumber?: string | null;
  phoneNumber?: string | null;
  department?: string | null;
  batchYear?: string | null;
};

export class VerificationService {
  static async createNotification(userId: string, message: string, type: string) {
    return db.notification.create({
      data: {
        userId,
        message,
        type,
        createdAt: new Date(),
      },
    });
  }

  static async getStudents(filters: {
    status?: string;
    department?: string;
    searchQuery?: string;
  }) {
    const where: any = {
      role: "STUDENT",
    };

    if (filters.status && filters.status !== "ALL") {
      where.verificationStatus = filters.status as VerificationStatus;
    }

    if (filters.department && filters.department !== "ALL") {
      where.department = {
        equals: filters.department,
        mode: "insensitive",
      };
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.trim();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { rollNumber: { contains: query, mode: "insensitive" } },
      ];
    }

    return db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        parentPhoneNumber: true,
        department: true,
        batchYear: true,
        rollNumber: true,
        createdAt: true,
        verificationStatus: true,
        verifiedBy: true,
        verifiedAt: true,
        correctionRequestedAt: true,
        linkedinUrl: true,
        skills: true,
        bio: true,
        memberships: {
          select: {
            team: {
              select: {
                id: true,
                name: true,
                faculty: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async verifyStudent(studentId: string, facultyId: string, facultyName: string) {
    const student = await db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error("Student not found.");
    }

    const oldStatus = student.verificationStatus;

    const updated = await db.user.update({
      where: { id: studentId },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedBy: facultyName,
        verifiedAt: new Date(),
      },
    });

    // Write to Change Log
    await AuditLogService.logEvent({
      studentId,
      fieldName: "verification_status",
      oldValue: oldStatus,
      newValue: VerificationStatus.VERIFIED,
      changedBy: facultyName,
      changedByRole: "FACULTY",
      reason: "Faculty verified student records",
    });

    // Create notification for student
    await this.createNotification(
      studentId,
      "Your profile has been verified.",
      "VERIFIED"
    );

    return updated;
  }

  static async editStudentRecord(
    studentId: string,
    fields: EditStudentFieldsInput,
    facultyId: string,
    facultyName: string,
    reason: string
  ) {
    const student = await db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error("Student not found.");
    }

    const updates: any = {};
    const logPromises: Promise<any>[] = [];

    // Fields mapping
    const fieldMapping: Record<keyof EditStudentFieldsInput, string> = {
      rollNumber: "rollNumber",
      parentPhoneNumber: "parentPhoneNumber",
      phoneNumber: "phoneNumber",
      department: "department",
      batchYear: "batchYear",
    };

    for (const key of Object.keys(fields) as Array<keyof EditStudentFieldsInput>) {
      const dbKey = fieldMapping[key];
      const newValue = fields[key] ?? null;
      const oldValue = (student as any)[dbKey] as string | null;

      if (newValue !== oldValue) {
        updates[dbKey] = newValue;

        logPromises.push(
          AuditLogService.logEvent({
            studentId,
            fieldName: dbKey,
            oldValue: oldValue ?? null,
            newValue: newValue ?? null,
            changedBy: facultyName,
            changedByRole: "FACULTY",
            reason,
          })
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return student;
    }

    // Always update verification status to verified if faculty manually edits/resolves, or keep current?
    // Let's keep status unless they verified. In this edit flow, they might just want to edit details.
    // Let's also log a high-level edit event.
    const updated = await db.user.update({
      where: { id: studentId },
      data: updates,
    });

    await Promise.all(logPromises);

    // Notify student
    await this.createNotification(
      studentId,
      `Faculty advisor has updated your profile details (${reason}).`,
      "FACULTY_EDIT"
    );

    return updated;
  }
}
