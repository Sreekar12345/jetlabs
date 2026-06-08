"use client";

import React, { useEffect, useState } from "react";
import { LoaderCircle, FileClock } from "lucide-react";

type LogRecord = {
  id: string;
  studentId: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedByRole: string;
  reason: string | null;
  timestamp: string;
};

type AuditHistoryPanelProps = {
  studentId: string;
  refreshTrigger?: number;
};

const FIELD_LABELS: Record<string, string> = {
  rollNumber: "Roll Number",
  parentPhoneNumber: "Parent Contact",
  phoneNumber: "Student Contact",
  department: "Department",
  batchYear: "Batch",
  verification_status: "Verification Status",
  linkedinUrl: "LinkedIn",
  skills: "Skills",
  bio: "Bio",
};

export function AuditHistoryPanel({ studentId, refreshTrigger }: AuditHistoryPanelProps) {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/faculty/student-verification/${studentId}/logs`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to load audit logs.");
        }

        setLogs(data.data?.logs ?? data.logs ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [studentId, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <LoaderCircle className="size-6 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading audit trail...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-sm text-red-500 font-semibold bg-red-50 rounded-2xl p-4">
        {error}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
        <FileClock className="size-8 mx-auto text-slate-350 mb-3" />
        <p className="text-xs font-bold text-slate-600">No audit logs found</p>
        <p className="text-[10px] text-slate-400 mt-1">Activities and profile edits will appear here.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-slate-100 pl-4 ml-3 space-y-6">
      {logs.map((log) => {
        const fieldLabel = FIELD_LABELS[log.fieldName] || log.fieldName;
        const dateStr = new Date(log.timestamp).toLocaleString();
        
        return (
          <div key={log.id} className="relative">
            {/* Timeline Dot */}
            <span className="absolute -left-[25px] top-1.5 size-3.5 rounded-full border-2 border-white bg-slate-300 ring-2 ring-slate-100" />
            
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-xs">
              <div className="flex items-center justify-between gap-3 text-slate-400 mb-2 font-medium">
                <span className="text-[10px]">
                  Changed by <strong className="text-slate-700">{log.changedBy}</strong> ({log.changedByRole})
                </span>
                <span className="text-[10px]">{dateStr}</span>
              </div>
              
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">
                  Updated field: <span className="text-indigo-600">{fieldLabel}</span>
                </p>
                
                {log.oldValue !== log.newValue && (
                  <div className="grid grid-cols-2 gap-2 mt-1.5 py-1 px-2.5 bg-slate-50 rounded-lg text-[10px]">
                    <div>
                      <span className="block font-medium text-slate-400">Old Value:</span>
                      <span className="font-bold text-slate-600 truncate block">
                        {log.oldValue === null ? <em className="text-slate-300 font-normal">empty</em> : log.oldValue}
                      </span>
                    </div>
                    <div>
                      <span className="block font-medium text-slate-400">New Value:</span>
                      <span className="font-bold text-indigo-600 truncate block">
                        {log.newValue === null ? <em className="text-slate-300 font-normal">empty</em> : log.newValue}
                      </span>
                    </div>
                  </div>
                )}
                
                {log.reason && (
                  <p className="mt-2 text-slate-500 leading-normal pl-2 border-l-2 border-slate-200">
                    <span className="font-semibold text-slate-600">Reason:</span> {log.reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
