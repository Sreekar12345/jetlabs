"use client";

import React, { useState } from "react";
import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

type CorrectionRequestModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  onSuccess: () => void;
};

const CORRECTION_REASONS = [
  "Incorrect Parent Number",
  "Incorrect Student Number",
  "Incorrect Roll Number",
  "Incorrect Department",
  "Incorrect Batch",
  "Other",
];

export function CorrectionRequestModal({
  isOpen,
  onOpenChange,
  studentId,
  studentName,
  onSuccess,
}: CorrectionRequestModalProps) {
  const [reason, setReason] = useState(CORRECTION_REASONS[0]);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/faculty/student-verification/${studentId}/correction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, comments }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to submit correction request.");
      }

      toast.success(`Correction request sent for ${studentName}.`);
      onSuccess();
      onOpenChange(false);
      setComments("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit correction request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md p-6 bg-white rounded-3xl shadow-xl">
        <ModalHeader className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <ModalTitle className="text-lg font-bold text-slate-900">
            Request Student Correction
          </ModalTitle>
          <ModalCloseButton onClick={() => onOpenChange(false)} />
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reason" className="text-sm font-semibold text-slate-700">
              Correction Reason *
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              {CORRECTION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="comments" className="text-sm font-semibold text-slate-700">
              Comments / Guidelines
            </label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide detail on what needs to be updated (e.g. Please enter a valid 10-digit number for Parent Mobile)."
              disabled={submitting}
              className="min-h-[100px] rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl font-semibold px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 px-5"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Correction Request"
              )}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
