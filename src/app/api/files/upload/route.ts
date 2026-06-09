import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/services/file-service";
import path from "path";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".zip", ".txt"
];

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain"
];

export async function POST(request: NextRequest) {
  try {
    const session = await requirePageSession();
    const userId = session.user.id;
    const userRole = session.user.role;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const teamId = formData.get("teamId") as string | null;
    const parentFileId = formData.get("parentFileId") as string | null;
    const submissionId = formData.get("submissionId") as string | null;

    if (!file) {
      return apiError({ code: "BAD_REQUEST", message: "No file was uploaded.", status: 400 });
    }

    if (!teamId) {
      return apiError({ code: "BAD_REQUEST", message: "teamId is required.", status: 400 });
    }

    // 1. Authorization checks
    if (userRole === "STUDENT") {
      const membership = await db.teamMember.findFirst({
        where: { userId, teamId }
      });
      if (!membership) {
        return apiError({ code: "FORBIDDEN", message: "You are not authorized to upload files for this team.", status: 403 });
      }
    } else if (userRole === "FACULTY") {
      const team = await db.team.findUnique({
        where: { id: teamId }
      });
      if (team?.facultyId !== userId) {
        return apiError({ code: "FORBIDDEN", message: "You can only upload files for teams you advise.", status: 403 });
      }
    } else if (userRole !== "ADMIN") {
      return apiError({ code: "FORBIDDEN", message: "Unauthorized role.", status: 403 });
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return apiError({
        code: "BAD_REQUEST",
        message: `File size exceeds the 10MB limit (Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
        status: 400
      });
    }

    // 3. Validate File Type / Extension
    const fileExtension = path.extname(file.name).toLowerCase();
    const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isMimeAllowed && !isExtensionAllowed) {
      return apiError({
        code: "BAD_REQUEST",
        message: `Unsupported file type "${fileExtension}". Supported: PDF, Word, PowerPoint, Excel, Images (JPG, PNG), Zip, and Plain Text.`,
        status: 400
      });
    }

    // 4. Save file using file service
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileRecord = await uploadFile({
      fileBuffer: buffer,
      fileName: file.name,
      fileType: file.type || fileExtension,
      fileSize: file.size,
      teamId,
      uploadedById: userId,
      parentFileId: parentFileId || undefined,
      submissionId: submissionId || undefined
    });

    return apiSuccess({ file: fileRecord });
  } catch (error: any) {
    console.error("API POST File Upload Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred during file upload.",
      status: 500
    });
  }
}
