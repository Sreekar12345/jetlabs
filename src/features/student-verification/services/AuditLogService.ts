import { db } from "@/lib/db";

export type AuditLogInput = {
  studentId: string;
  fieldName: string;
  oldValue?: string | null;
  newValue?: string | null;
  changedBy: string;
  changedByRole: string;
  reason?: string | null;
};

export class AuditLogService {
  static async logEvent(input: AuditLogInput) {
    return db.studentChangeLog.create({
      data: {
        studentId: input.studentId,
        fieldName: input.fieldName,
        oldValue: input.oldValue ?? null,
        newValue: input.newValue ?? null,
        changedBy: input.changedBy,
        changedByRole: input.changedByRole,
        reason: input.reason ?? null,
        timestamp: new Date(),
      },
    });
  }

  static async getLogs(studentId: string) {
    return db.studentChangeLog.findMany({
      where: { studentId },
      orderBy: { timestamp: "desc" },
    });
  }
}
