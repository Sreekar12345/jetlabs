import { db } from "@/lib/db";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface UploadFileInput {
  fileBuffer: Buffer;
  fileName: string;
  fileType: string;
  fileSize: number;
  teamId: string;
  uploadedById: string;
  parentFileId?: string;
  submissionId?: string;
}

/**
 * Uploads a file, saves it to local disk under a non-colliding name,
 * and records its metadata and version state in the database.
 */
export async function uploadFile(input: UploadFileInput) {
  try {
    const storageFileName = `${crypto.randomUUID()}_${input.fileName}`;
    const storagePath = path.join("uploads", storageFileName);
    const absolutePath = path.join(process.cwd(), storagePath);

    // Write file to local disk
    await fs.promises.writeFile(absolutePath, input.fileBuffer);

    const result = await db.$transaction(async (tx) => {
      if (input.parentFileId) {
        // Retrieve parent file
        const parentFile = await tx.projectFile.findUnique({
          where: { id: input.parentFileId }
        });

        if (!parentFile) {
          throw new Error("PARENT_FILE_NOT_FOUND");
        }

        // Get actual root file ID (parentFileId of version 1 is null, its own ID is the root file ID)
        const rootFileId = parentFile.parentFileId || parentFile.id;

        // Get latest version number
        const latestVersionFile = await tx.projectFile.findFirst({
          where: {
            OR: [
              { id: rootFileId },
              { parentFileId: rootFileId }
            ]
          },
          orderBy: { version: "desc" }
        });
        const nextVersion = (latestVersionFile?.version ?? 1) + 1;

        // Set isLatest = false for all previous versions
        await tx.projectFile.updateMany({
          where: {
            OR: [
              { id: rootFileId },
              { parentFileId: rootFileId }
            ]
          },
          data: { isLatest: false }
        });

        // Create new version file
        const fileRecord = await tx.projectFile.create({
          data: {
            fileName: input.fileName,
            fileType: input.fileType,
            fileSize: input.fileSize,
            storagePath,
            uploadedById: input.uploadedById,
            teamId: input.teamId,
            submissionId: input.submissionId || parentFile.submissionId || null,
            version: nextVersion,
            isLatest: true,
            parentFileId: rootFileId,
          }
        });

        // Log Replacement Audit
        await tx.fileAuditLog.create({
          data: {
            fileId: fileRecord.id,
            userId: input.uploadedById,
            action: "REPLACE",
            details: `Replaced version of "${input.fileName}" to version ${nextVersion}.`,
          }
        });

        return fileRecord;
      } else {
        // Initial version upload
        const fileRecord = await tx.projectFile.create({
          data: {
            fileName: input.fileName,
            fileType: input.fileType,
            fileSize: input.fileSize,
            storagePath,
            uploadedById: input.uploadedById,
            teamId: input.teamId,
            submissionId: input.submissionId || null,
            version: 1,
            isLatest: true,
          }
        });

        // Log Upload Audit
        await tx.fileAuditLog.create({
          data: {
            fileId: fileRecord.id,
            userId: input.uploadedById,
            action: "UPLOAD",
            details: `Uploaded initial version of "${input.fileName}".`,
          }
        });

        return fileRecord;
      }
    });

    try {
      const { logSystemEvent } = await import("@/lib/services/audit-service");
      const user = await db.user.findUnique({
        where: { id: input.uploadedById },
        select: { role: true },
      });
      if (user) {
        const isReplace = !!input.parentFileId;
        await logSystemEvent({
          userId: input.uploadedById,
          userRole: user.role,
          actionType: isReplace ? "FILE_REPLACED" : "FILE_UPLOADED",
          eventCategory: "FILE_UPLOAD",
          entityType: "ProjectFile",
          entityId: result.id,
          actionPerformed: isReplace
            ? `Replaced file with new version "${input.fileName}" (Version ${result.version}).`
            : `Uploaded file "${input.fileName}".`,
          metadata: {
            fileName: input.fileName,
            fileSize: input.fileSize,
            version: result.version,
            teamId: input.teamId,
          },
        });
      }
    } catch (auditError) {
      console.error("Failed to log file upload/replace audit:", auditError);
    }

    return result;
  } catch (error) {
    console.error("Error in uploadFile service:", error);
    throw error;
  }
}

/**
 * Checks authorization to access/download/view files based on user roles and teams.
 */
export async function verifyFileAccess(fileId: string, userId: string, userRole: string) {
  try {
    if (userRole === "ADMIN") return true;

    const file = await db.projectFile.findUnique({
      where: { id: fileId }
    });

    if (!file) return false;

    if (userRole === "FACULTY") {
      const team = await db.team.findUnique({
        where: { id: file.teamId }
      });
      return team?.facultyId === userId;
    }

    if (userRole === "STUDENT") {
      const membership = await db.teamMember.findFirst({
        where: { userId }
      });
      return membership?.teamId === file.teamId;
    }

    return false;
  } catch (error) {
    console.error("Error verifying file access:", error);
    return false;
  }
}

/**
 * Logs file access actions to the audit trail table.
 */
export async function logFileAudit(fileId: string, userId: string, action: string, details?: string) {
  try {
    const log = await db.fileAuditLog.create({
      data: {
        fileId,
        userId,
        action,
        details: details || null,
      }
    });

    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user) {
        const { logSystemEvent } = await import("@/lib/services/audit-service");
        await logSystemEvent({
          userId,
          userRole: user.role,
          actionType: `FILE_${action.toUpperCase()}`,
          eventCategory: "FILE_UPLOAD",
          entityType: "ProjectFile",
          entityId: fileId,
          actionPerformed: details || `${action} file ${fileId}`,
        });
      }
    } catch (auditError) {
      console.error("Failed to log file action audit event:", auditError);
    }

    return log;
  } catch (error) {
    console.error("Error logging file audit:", error);
  }
}

/**
 * Retrieves full replacement history of a file, ordered latest first.
 */
export async function getFileHistory(fileId: string) {
  try {
    const file = await db.projectFile.findUnique({
      where: { id: fileId }
    });

    if (!file) return [];

    const rootFileId = file.parentFileId || file.id;

    return await db.projectFile.findMany({
      where: {
        OR: [
          { id: rootFileId },
          { parentFileId: rootFileId }
        ]
      },
      orderBy: { version: "desc" },
      include: {
        uploadedBy: {
          select: { name: true }
        },
        auditLogs: {
          orderBy: { timestamp: "desc" }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching file history:", error);
    throw error;
  }
}

/**
 * Associates temporary uploads with a submission ID after final submit.
 */
export async function associateFilesWithSubmission(fileIds: string[], submissionId: string) {
  try {
    if (!fileIds || fileIds.length === 0) return;
    return await db.projectFile.updateMany({
      where: {
        id: { in: fileIds }
      },
      data: {
        submissionId
      }
    });
  } catch (error) {
    console.error("Error associating files with submission:", error);
    throw error;
  }
}

/**
 * Fetches latest version files linked to a specific submission.
 */
export async function getSubmissionFiles(submissionId: string) {
  try {
    return await db.projectFile.findMany({
      where: {
        submissionId,
        isLatest: true
      },
      include: {
        uploadedBy: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Error fetching submission files:", error);
    throw error;
  }
}
