import { db } from "@/lib/db";
import { VerificationStatus } from "@prisma/client";
import { AuditLogService } from "./AuditLogService";

export type StudentCorrectionInput = {
  phoneNumber?: string | null;
  parentPhoneNumber?: string | null;
  linkedinUrl?: string | null;
  skills?: string | null;
  bio?: string | null;
};

export class CorrectionService {
  static async requestCorrection(
    studentId: string,
    reason: string,
    comments: string,
    facultyId: string,
    facultyName: string
  ) {
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
        verificationStatus: VerificationStatus.CORRECTION_REQUESTED,
        correctionRequestedAt: new Date(),
      },
    });

    // Log the correction request
    const reasonDetail = `Correction requested: ${reason}. Comments: ${comments}`;
    await AuditLogService.logEvent({
      studentId,
      fieldName: "verification_status",
      oldValue: oldStatus,
      newValue: VerificationStatus.CORRECTION_REQUESTED,
      changedBy: facultyName,
      changedByRole: "FACULTY",
      reason: reasonDetail,
    });

    // Create notification for student
    await db.notification.create({
      data: {
        userId: studentId,
        message: `Faculty has requested corrections to your profile. Reason: ${reason}. Please update your details.`,
        type: "CORRECTION_REQUEST",
        createdAt: new Date(),
      },
    });

    return updated;
  }

  static async submitCorrection(studentId: string, input: StudentCorrectionInput) {
    const student = await db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error("Student not found.");
    }

    const updates: any = {
      verificationStatus: VerificationStatus.PENDING,
    };
    const logPromises: Promise<any>[] = [];

    // Fields mapping
    const fieldMapping: Record<keyof StudentCorrectionInput, string> = {
      phoneNumber: "phoneNumber",
      parentPhoneNumber: "parentPhoneNumber",
      linkedinUrl: "linkedinUrl",
      skills: "skills",
      bio: "bio",
    };

    for (const key of Object.keys(input) as Array<keyof StudentCorrectionInput>) {
      const dbKey = fieldMapping[key];
      const newValue = input[key] ?? null;
      const oldValue = (student as any)[dbKey] as string | null;

      if (newValue !== oldValue) {
        updates[dbKey] = newValue;

        logPromises.push(
          AuditLogService.logEvent({
            studentId,
            fieldName: dbKey,
            oldValue: oldValue ?? null,
            newValue: newValue ?? null,
            changedBy: student.name,
            changedByRole: "STUDENT",
            reason: "Student updated details to address correction request",
          })
        );
      }
    }

    const updated = await db.user.update({
      where: { id: studentId },
      data: updates,
    });

    await Promise.all(logPromises);

    // Log high level status change
    await AuditLogService.logEvent({
      studentId,
      fieldName: "verification_status",
      oldValue: student.verificationStatus,
      newValue: VerificationStatus.PENDING,
      changedBy: student.name,
      changedByRole: "STUDENT",
      reason: "Student submitted profile corrections",
    });

    // Notify faculty advisor
    if (student.facultyId) {
      await db.notification.create({
        data: {
          userId: student.facultyId,
          message: `${student.name} has updated the requested information.`,
          type: "CORRECTION_SUBMITTED",
          createdAt: new Date(),
        },
      });
    }

    return updated;
  }
}
