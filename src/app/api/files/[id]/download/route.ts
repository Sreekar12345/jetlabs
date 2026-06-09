import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/response";
import { requirePageSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { verifyFileAccess, logFileAudit } from "@/lib/services/file-service";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePageSession();
    const userId = session.user.id;
    const userRole = session.user.role;
    const { id: fileId } = await context.params;

    // 1. Verify access permissions
    const hasAccess = await verifyFileAccess(fileId, userId, userRole);
    if (!hasAccess) {
      return apiError({ code: "FORBIDDEN", message: "You are not authorized to access this file.", status: 403 });
    }

    // 2. Fetch file metadata
    const file = await db.projectFile.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return apiError({ code: "NOT_FOUND", message: "File not found in database.", status: 404 });
    }

    const absolutePath = path.join(process.cwd(), file.storagePath);
    if (!fs.existsSync(absolutePath)) {
      return apiError({ code: "NOT_FOUND", message: "File not found on storage disk.", status: 404 });
    }

    // 3. Read file buffer
    const fileBuffer = await fs.promises.readFile(absolutePath);

    // 4. Log Download Audit Action
    await logFileAudit(file.id, userId, "DOWNLOAD", `Downloaded file "${file.fileName}" (Version: ${file.version}).`);

    // 5. Stream download response
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": file.fileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
        "Content-Length": file.fileSize.toString(),
      }
    });
  } catch (error: any) {
    console.error("API GET File Download Error:", error);
    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred during file download.",
      status: 500
    });
  }
}
