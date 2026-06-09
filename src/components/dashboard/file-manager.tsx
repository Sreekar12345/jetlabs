"use client";

import { useEffect, useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  X,
  FileDown,
  History,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Calendar,
  User,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileAuditLog {
  id: string;
  fileId: string;
  userId: string;
  action: "UPLOAD" | "DOWNLOAD" | "REPLACE" | "VIEW";
  details: string | null;
  timestamp: string;
}

interface ProjectFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  uploadedById: string;
  teamId: string;
  submissionId: string | null;
  version: number;
  isLatest: boolean;
  parentFileId: string | null;
  createdAt: string;
  uploadedBy?: { name: string } | null;
  auditLogs?: FileAuditLog[];
}

interface FileManagerProps {
  teamId: string;
  submissionId?: string;
  onFilesChange?: (fileIds: string[]) => void;
  isReadOnly?: boolean;
}

const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".zip", ".txt"
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileManager({
  teamId,
  submissionId,
  onFilesChange,
  isReadOnly = false,
}: FileManagerProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Version History Modal State
  const [historyFile, setHistoryFile] = useState<ProjectFile | null>(null);
  const [historyList, setHistoryList] = useState<ProjectFile[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Replacement File Input State
  const [replaceTargetFileId, setReplaceTargetFileId] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let url = "";
      if (submissionId) {
        url = `/api/files?submissionId=${submissionId}`;
      } else {
        url = `/api/files?teamId=${teamId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Filter out files that don't belong to this submission if in student draft mode
          const latestFiles = json.data.files;
          setFiles(latestFiles);
          if (onFilesChange) {
            onFilesChange(latestFiles.map((f: ProjectFile) => f.id));
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId || submissionId) {
      fetchFiles();
    }
  }, [teamId, submissionId]);

  const validateFile = (file: File): boolean => {
    // Check size
    if (file.size > MAX_SIZE) {
      toast.error(`"${file.name}" exceeds 10MB size limit.`);
      return false;
    }

    // Check extension
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      toast.error(`"${extension}" format is not allowed.`);
      return false;
    }

    return true;
  };

  const handleUpload = async (file: File, parentFileId?: string) => {
    if (!validateFile(file)) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("teamId", teamId);
    if (parentFileId) {
      formData.append("parentFileId", parentFileId);
    }
    if (submissionId) {
      formData.append("submissionId", submissionId);
    }

    try {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          toast.success(
            parentFileId
              ? `Version ${json.data.file.version} of "${file.name}" uploaded!`
              : `"${file.name}" uploaded successfully!`
          );
          
          // Refresh list
          fetchFiles();
        } else {
          toast.error(json.message || "Upload failed.");
        }
      } else {
        toast.error("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during upload.");
    } finally {
      setUploading(false);
      setReplaceTargetFileId(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isReadOnly) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      handleUpload(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && replaceTargetFileId) {
      handleUpload(e.target.files[0], replaceTargetFileId);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerReplaceSelect = (fileId: string) => {
    setReplaceTargetFileId(fileId);
    setTimeout(() => {
      replaceInputRef.current?.click();
    }, 50);
  };

  const handleDownload = (fileId: string, fileName: string) => {
    // Open in a new tab to download
    window.open(`/api/files/${fileId}/download`, "_blank");
  };

  const fetchHistory = async (file: ProjectFile) => {
    setHistoryFile(file);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/files/${file.id}/history`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setHistoryList(json.data.history);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load file history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = "." + fileName.split(".").pop()?.toLowerCase();
    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      return <FileImage className="size-5 text-emerald-400" />;
    }
    if ([".xls", ".xlsx"].includes(ext)) {
      return <FileSpreadsheet className="size-5 text-teal-400" />;
    }
    if ([".zip"].includes(ext)) {
      return <FileArchive className="size-5 text-amber-400" />;
    }
    return <FileText className="size-5 text-indigo-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone (Editable Mode only) */}
      {!isReadOnly && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/[0.04] scale-[0.99]"
              : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={ALLOWED_EXTENSIONS.join(",")}
          />
          <input
            type="file"
            ref={replaceInputRef}
            onChange={handleReplaceChange}
            className="hidden"
            accept={ALLOWED_EXTENSIONS.join(",")}
          />

          <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500 border border-indigo-500/20 mb-3 animate-pulse">
            <UploadCloud className="size-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-700">
              Drag & Drop files here, or <span className="text-indigo-600 hover:text-indigo-700 underline">browse</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Supports PDF, Word, PowerPoint, Excel, Images (JPG, PNG), Zip, and Text files (Max 10MB).
            </p>
          </div>
        </div>
      )}

      {/* Files List */}
      {loading ? (
        <div className="flex h-32 items-center justify-center gap-2">
          <RefreshCw className="size-5 animate-spin text-indigo-500" />
          <span className="text-xs text-slate-400">Loading files...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="flex h-24 flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50/20 rounded-2xl p-4 text-center">
          <AlertCircle className="size-5 text-slate-300 mb-1" />
          <p className="text-xs text-slate-400 font-medium">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3.5 hover:bg-slate-50/40 transition-colors"
            >
              {/* Left: Metadata */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 shrink-0">
                  {getFileIcon(file.fileName)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate" title={file.fileName}>
                    {file.fileName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[10px] text-slate-400 font-semibold uppercase">
                    <span>{formatBytes(file.fileSize)}</span>
                    <span>·</span>
                    <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[8px] font-bold">
                      V{file.version}
                    </span>
                    {file.uploadedBy?.name && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <User className="size-3 text-slate-400" />
                          {file.uploadedBy.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleDownload(file.id, file.fileName)}
                  className="flex items-center justify-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 p-2 text-slate-500 hover:text-slate-900 transition-all"
                  title="Download File"
                >
                  <FileDown className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => fetchHistory(file)}
                  className="flex items-center justify-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 p-2 text-slate-500 hover:text-slate-900 transition-all text-xs font-bold"
                  title="Version History"
                >
                  <History className="size-4" />
                  <span>History</span>
                </button>

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => triggerReplaceSelect(file.id)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/30 p-2 text-indigo-600 font-bold text-xs transition-all"
                    title="Replace File"
                  >
                    <RefreshCw className="size-4" />
                    <span>Replace</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Version History Modal */}
      {historyFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="relative w-full max-w-[500px] bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-200 tracking-tight">Version & Replacement Audit</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[320px] font-semibold">{historyFile.fileName}</p>
              </div>
              <button
                onClick={() => setHistoryFile(null)}
                className="rounded-full bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {loadingHistory ? (
                <div className="flex h-40 items-center justify-center gap-2">
                  <RefreshCw className="size-5 animate-spin text-indigo-400" />
                  <span className="text-xs text-slate-400">Loading version logs...</span>
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-8">No history logs.</div>
              ) : (
                <div className="relative border-l border-white/10 ml-3 pl-5 space-y-5 py-2">
                  {historyList.map((hist) => {
                    const uploadAudit = hist.auditLogs?.find((a: FileAuditLog) => a.action === "UPLOAD");
                    const replaceAudit = hist.auditLogs?.find((a: FileAuditLog) => a.action === "REPLACE");
                    const auditDetails = replaceAudit?.details || uploadAudit?.details || "File version active.";

                    return (
                      <div key={hist.id} className="relative group space-y-1.5 text-xs text-slate-300">
                        {/* Status timeline dot */}
                        <div className={`absolute -left-[25px] top-1 flex h-2 w-2 items-center justify-center rounded-full border border-slate-900 ${
                          hist.isLatest ? "bg-emerald-500 shadow-md shadow-emerald-500/50" : "bg-slate-600"
                        }`} />

                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold tracking-wide uppercase">
                          <span className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300 font-bold">
                            Version {hist.version} {hist.isLatest && "(LATEST)"}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Calendar className="size-3" />
                            {new Date(hist.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-start gap-2 pt-0.5">
                          <div>
                            <p className="text-slate-100 font-bold">{hist.fileName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                              Size: {formatBytes(hist.fileSize)} · By {hist.uploadedBy?.name || "Member"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownload(hist.id, hist.fileName)}
                            className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 p-1.5 text-slate-300 hover:text-white"
                            title="Download this version"
                          >
                            <FileDown className="size-3.5" />
                          </button>
                        </div>

                        {/* Audit message details */}
                        <div className="rounded-lg bg-white/[0.02] p-2 text-[10px] leading-relaxed text-slate-400 border border-white/5 italic">
                          {auditDetails}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-5 py-3 bg-slate-950/20 text-right">
              <Button
                variant="outline"
                onClick={() => setHistoryFile(null)}
                className="h-8 text-[11px] rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                Close Logs
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
